import { describe, expect, it, vi } from "vitest";

import {
  discoverConnectProvider,
  listKnownMailboxWebProviders,
  resolveConnectProviderByEmailAddress,
  resolveConnectProviderGuide
} from "../src/auth/oauth-providers.js";

describe("connect provider guides", () => {
  it("covers the common mailbox presets with login metadata and protocol defaults", () => {
    const cases = [
      ["person@gmail.com", "gmail", "imap.gmail.com", "smtp.gmail.com", "App password"],
      ["person@outlook.com", "outlook", "outlook.office365.com", "smtp.office365.com", "Mailbox password or app password"],
      ["person@qq.com", "qq", "imap.qq.com", "smtp.qq.com", "Authorization code"],
      ["person@icloud.com", "icloud", "imap.mail.me.com", "smtp.mail.me.com", "App-specific password"],
      ["person@yahoo.com", "yahoo", "imap.mail.yahoo.com", "smtp.mail.yahoo.com", "Mailbox password or app password"],
      ["person@163.com", "163", "imap.163.com", "smtp.163.com", "Authorization code"],
      ["person@126.com", "126", "imap.126.com", "smtp.126.com", "Authorization code"]
    ] as const;

    for (const [emailAddress, providerId, imapHost, smtpHost, credentialLabel] of cases) {
      const guide = resolveConnectProviderByEmailAddress(emailAddress);
      expect(guide?.id).toBe(providerId);
      expect(guide?.login).toMatchObject({
        emailFirst: true,
        credentialLabel
      });
      expect(guide?.preset).toMatchObject({
        imapHost,
        smtpHost
      });
      expect(guide?.web?.loginUrl).toEqual(expect.any(String));
    }
  });

  it("covers common webmail fallbacks with official login pages", () => {
    const knownProviders = listKnownMailboxWebProviders();
    const ids = new Set(knownProviders.map((provider) => provider.id));

    for (const providerId of ["proton", "zoho", "aol", "gmx", "mail-com", "yandex", "fastmail"]) {
      expect(ids.has(providerId)).toBe(true);
      const provider = knownProviders.find((entry) => entry.id === providerId);
      expect(provider?.web.loginUrl).toEqual(expect.any(String));
    }
  });

  it("keeps the generic imap path available when a domain is unknown", () => {
    const guide = resolveConnectProviderByEmailAddress("person@custom.example");
    expect(guide?.id).toBe("imap");
    expect(resolveConnectProviderGuide("imap")?.login).toMatchObject({
      emailFirst: true,
      credentialLabel: "Mailbox password / app password / authorization code"
    });
  });

  it("keeps known presets local and does not hit remote autoconfig", async () => {
    const fetchMock = vi.fn();

    const discovery = await discoverConnectProvider({
      emailAddress: "person@gmail.com",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    expect(discovery).toMatchObject({
      source: "preset",
      provider: {
        id: "gmail"
      },
      preset: {
        imapHost: "imap.gmail.com",
        smtpHost: "smtp.gmail.com"
      }
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses Thunderbird-style autoconfig when the domain is not built in", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="example.net">
    <domain>example.net</domain>
    <displayShortName>Example Mail</displayShortName>
    <incomingServer type="imap">
      <hostname>imap.example.net</hostname>
      <port>993</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>smtp.example.net</hostname>
      <port>465</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
    </outgoingServer>
  </emailProvider>
</clientConfig>`;
    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith("https://autoconfig.example.net/")) {
        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "application/xml"
          }
        });
      }
      return new Response("not found", {
        status: 404
      });
    });

    const discovery = await discoverConnectProvider({
      emailAddress: "person@example.net",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    expect(discovery).toMatchObject({
      emailAddress: "person@example.net",
      domain: "example.net",
      source: "domain_autoconfig",
      provider: {
        id: "imap",
        accountProvider: "imap"
      },
      preset: {
        imapHost: "imap.example.net",
        imapPort: 993,
        smtpHost: "smtp.example.net",
        smtpPort: 465
      }
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
