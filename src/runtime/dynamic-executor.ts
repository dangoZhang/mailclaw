import fs from "node:fs";

import type { DatabaseSync } from "node:sqlite";

import type { AppConfig } from "../config.js";
import type { MailAgentExecutionResult, MailAgentExecutor, ExecuteMailTurnInput } from "./agent-executor.js";
import { createBuiltInEmbeddedRuntimeAdapter } from "./embedded-default-adapter.js";
import { createEmbeddedMailRuntimeExecutor } from "./embedded-executor.js";
import { createFileBackedOpenClawBridgeSessionManager } from "../openclaw/session-manager.js";
import {
  assertCanonicalMemoryNamespaceDescriptors,
  assertExecutionPolicyAllowsTurn,
  assertRuntimePolicyManifestAllowsTurn,
  prepareExecutionAttachments
} from "./execution-context.js";
import {
  buildOpenClawResponsesRequest,
  extractOpenClawResponseText,
  parseOpenClawSseStream
} from "../openclaw/bridge.js";
import type { MailRuntimeExecutionBoundary, MailTurnAttachmentDescriptor } from "../core/types.js";
import { resolveRuntimeModelProfile } from "./runtime-model-registry.js";

const MAX_INLINE_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export interface DynamicMailAgentExecutorOptions {
  fetchImpl?: typeof fetch;
}

export function createDynamicMailAgentExecutor(
  db: DatabaseSync,
  config: AppConfig,
  options: DynamicMailAgentExecutorOptions = {}
): MailAgentExecutor {
  const fetchImpl = options.fetchImpl ?? fetch;
  const embeddedExecutor = createEmbeddedMailRuntimeExecutor(config, {
    adapter: createBuiltInEmbeddedRuntimeAdapter()
  });
  const bridgeSessionManager = createFileBackedOpenClawBridgeSessionManager(config);

  return {
    inspectRuntime() {
      const resolved = resolveRuntimeModelProfile(db, config).profile;
      return describeDynamicRuntimeBoundary(
        config,
        resolved ?? {
          profileId: "builtin:embedded",
          label: "Embedded deterministic adapter",
          sourceKind: "embedded",
          model: "embedded-deterministic",
          builtin: true,
          enabled: true
        }
      );
    },
    async executeMailTurn(input) {
      const resolved = resolveRuntimeModelProfile(db, config, {
        tenantId: input.tenantId,
        agentId: input.ownerAgentId
      });
      const effectiveProfile = resolved.profile;

      if (!effectiveProfile || !effectiveProfile.enabled || effectiveProfile.sourceKind === "embedded") {
        return embeddedExecutor.executeMailTurn(input);
      }

      if (
        effectiveProfile.sourceKind === "openclaw_reuse" ||
        effectiveProfile.sourceKind === "openclaw_login"
      ) {
        return executeOpenClawTurn({
          config,
          profile: effectiveProfile,
          input,
          fetchImpl,
          sessionManager: bridgeSessionManager
        });
      }

      return executeApiKeyTurn({
        config,
        profile: effectiveProfile,
        input,
        fetchImpl
      });
    }
  };
}

async function executeOpenClawTurn(input: {
  config: AppConfig;
  profile: NonNullable<ReturnType<typeof resolveRuntimeModelProfile>["profile"]>;
  input: ExecuteMailTurnInput;
  fetchImpl: typeof fetch;
  sessionManager: ReturnType<typeof createFileBackedOpenClawBridgeSessionManager>;
}) {
  assertExecutionPolicyAllowsTurn(input.input);
  assertCanonicalMemoryNamespaceDescriptors(input.config, input.input);
  assertRuntimePolicyManifestAllowsTurn({
    runtimeKind: "bridge",
    runtimeLabel: input.profile.baseUrl ?? input.profile.label,
    executionInput: input.input,
    policyManifest: resolvePolicyManifest(input.config)
  });
  const startedAt = new Date().toISOString();
  const session = input.sessionManager.describeSession({
    sessionKey: input.input.sessionKey,
    agentId: input.input.agentId ?? input.profile.openClawAgentId ?? input.config.openClaw.agentId,
    now: startedAt
  });
  const attachments = prepareExecutionAttachments(input.config, input.input);
  const request = buildOpenClawResponsesRequest({
    baseUrl: input.profile.baseUrl ?? input.config.openClaw.baseUrl,
    agentId: input.input.agentId ?? input.profile.openClawAgentId ?? input.config.openClaw.agentId,
    sessionKey: input.input.sessionKey,
    inputText: input.input.inputText,
    sessionHeaders: session.transportHeaders,
    sessionMetadata: session.metadata,
    attachments,
    memoryNamespaces: input.input.memoryNamespaces,
    executionPolicy: input.input.executionPolicy,
    model: input.profile.model,
    gatewayToken: input.profile.gatewayToken
  });
  const response = await input.fetchImpl(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  const raw = await response.text();
  const completedAt = new Date().toISOString();
  const responseText = extractOpenClawResponseText(parseOpenClawSseStream(raw)).trim();

  if (!response.ok) {
    throw new Error(`runtime bridge request failed: ${response.status} ${responseText || response.statusText}`.trim());
  }

  input.sessionManager.appendTranscriptEntries({
    sessionKey: input.input.sessionKey,
    agentId: input.input.agentId ?? input.profile.openClawAgentId ?? input.config.openClaw.agentId,
    now: completedAt,
    entries: [
      {
        role: "user",
        text: input.input.inputText
      },
      {
        role: "assistant",
        text: responseText
      }
    ]
  });

  return {
    startedAt,
    completedAt,
    responseText,
    request: sanitizeRequest(request)
  } satisfies MailAgentExecutionResult;
}

async function executeApiKeyTurn(input: {
  config: AppConfig;
  profile: NonNullable<ReturnType<typeof resolveRuntimeModelProfile>["profile"]>;
  input: ExecuteMailTurnInput;
  fetchImpl: typeof fetch;
}) {
  assertExecutionPolicyAllowsTurn(input.input);
  assertCanonicalMemoryNamespaceDescriptors(input.config, input.input);
  assertRuntimePolicyManifestAllowsTurn({
    runtimeKind: "bridge",
    runtimeLabel: input.profile.baseUrl ?? input.profile.label,
    executionInput: input.input,
    policyManifest: resolvePolicyManifest(input.config)
  });
  const attachments = prepareExecutionAttachments(input.config, input.input);
  const startedAt = new Date().toISOString();
  const request = buildApiKeyResponsesRequest({
    baseUrl: input.profile.baseUrl,
    apiKey: input.profile.apiKey,
    model: input.profile.model,
    inputText: input.input.inputText,
    attachments,
    memoryNamespaces: input.input.memoryNamespaces,
    executionPolicy: input.input.executionPolicy
  });
  const response = await input.fetchImpl(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  const raw = await response.text();
  const completedAt = new Date().toISOString();
  const responseText = extractOpenClawResponseText(parseOpenClawSseStream(raw)).trim();

  if (!response.ok) {
    throw new Error(`api key runtime request failed: ${response.status} ${responseText || response.statusText}`.trim());
  }

  return {
    startedAt,
    completedAt,
    responseText,
    request: sanitizeRequest(request)
  } satisfies MailAgentExecutionResult;
}

function buildApiKeyResponsesRequest(input: {
  baseUrl?: string;
  apiKey?: string;
  model: string;
  inputText: string;
  attachments?: MailTurnAttachmentDescriptor[];
  memoryNamespaces?: ExecuteMailTurnInput["memoryNamespaces"];
  executionPolicy?: ExecuteMailTurnInput["executionPolicy"];
}) {
  const baseUrl = input.baseUrl?.trim() || "https://api.openai.com";
  if (!input.apiKey?.trim()) {
    throw new Error("api key runtime profile is missing apiKey");
  }
  const url = new URL("/v1/responses", baseUrl).toString();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${input.apiKey.trim()}`
  };
  const metadata: Record<string, string> = {};
  if (input.memoryNamespaces) {
    metadata.mailclaw_memory_namespaces = JSON.stringify(input.memoryNamespaces);
  }
  if (input.executionPolicy) {
    metadata.mailclaw_execution_policy = JSON.stringify(input.executionPolicy);
  }
  if (input.attachments?.length) {
    metadata.mailclaw_turn_attachments = JSON.stringify(input.attachments);
  }

  const body = {
    model: input.model,
    stream: true,
    ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: input.inputText
          },
          ...buildInlineAttachmentInputs(input.attachments)
        ]
      }
    ]
  };

  return {
    url,
    method: "POST" as const,
    headers,
    body: JSON.stringify(body)
  };
}

function buildInlineAttachmentInputs(attachments?: MailTurnAttachmentDescriptor[]) {
  if (!attachments?.length) {
    return [];
  }
  return attachments.flatMap((attachment) => {
    const inputPath = attachment.preferredInputPath;
    if (!inputPath || !fs.existsSync(inputPath)) {
      return [];
    }
    const fileBuffer = fs.readFileSync(inputPath);
    if (fileBuffer.byteLength > MAX_INLINE_ATTACHMENT_BYTES) {
      return [];
    }
    return [
      {
        type: "input_file",
        filename: attachment.preferredInputFilename ?? attachment.filename,
        file_data: `data:${attachment.preferredInputMimeType ?? attachment.mimeType};base64,${fileBuffer.toString("base64")}`
      }
    ];
  });
}

function sanitizeRequest(request: {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
}) {
  const headers = { ...request.headers };
  delete headers.Authorization;
  const body = JSON.parse(request.body) as Record<string, unknown>;
  sanitizeRequestBody(body);

  return {
    url: request.url,
    method: request.method,
    headers,
    body
  };
}

function sanitizeRequestBody(body: Record<string, unknown>) {
  const input = Array.isArray(body.input) ? body.input : [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as { content?: unknown };
    if (!Array.isArray(record.content)) {
      continue;
    }
    for (const content of record.content) {
      if (typeof content !== "object" || content === null) {
        continue;
      }
      const entry = content as { type?: unknown; file_data?: unknown };
      if (entry.type === "input_file" && typeof entry.file_data === "string") {
        entry.file_data = "[redacted-inline-file]";
      }
    }
  }
}

function describeDynamicRuntimeBoundary(
  config: AppConfig,
  profile: NonNullable<ReturnType<typeof resolveRuntimeModelProfile>["profile"]>
): MailRuntimeExecutionBoundary {
  if (profile.sourceKind === "embedded") {
    return {
      runtimeKind: "embedded",
      runtimeLabel: profile.label,
      policyManifest: createBuiltInEmbeddedRuntimeAdapter().policyManifest,
      manifestSource: "executor",
      namespaceValidation: true,
      canonicalWorkspaceBinding: true,
      policyAdmissionRequired: true,
      backendEnforcement: "process_adapter"
    };
  }

  if (profile.sourceKind === "openclaw_reuse" || profile.sourceKind === "openclaw_login") {
    return {
      runtimeKind: "bridge",
      runtimeLabel: profile.label,
      policyManifest: resolvePolicyManifest(config),
      manifestSource: config.runtime.policyManifest ? "config" : "executor",
      namespaceValidation: true,
      canonicalWorkspaceBinding: true,
      policyAdmissionRequired: true,
      backendEnforcement: "external_runtime"
    };
  }

  return {
    runtimeKind: "custom",
    runtimeLabel: profile.label,
    policyManifest: resolvePolicyManifest(config),
    manifestSource: config.runtime.policyManifest ? "config" : "executor",
    namespaceValidation: true,
    canonicalWorkspaceBinding: true,
    policyAdmissionRequired: true,
    backendEnforcement: "custom"
  };
}

function resolvePolicyManifest(config: AppConfig) {
  return config.runtime.policyManifest ?? createBuiltInEmbeddedRuntimeAdapter().policyManifest;
}
