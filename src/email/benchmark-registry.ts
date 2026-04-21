export interface EmailBenchmarkDefinition {
  benchmarkId: string;
  datasetId: string;
  name: string;
  task: "summarization" | "action_items" | "event_extraction" | "reply_alignment";
  homepage: string;
  primaryMetrics: string[];
  whyItMatters: string;
}

export const emailBenchmarkRegistry: EmailBenchmarkDefinition[] = [
  {
    benchmarkId: "emailsum-thread-summarization",
    datasetId: "emailsum",
    name: "EmailSum Thread Summarization",
    task: "summarization",
    homepage: "https://github.com/ZhangShiyue/EmailSum",
    primaryMetrics: ["summary_relevance", "context_retention", "compression_quality"],
    whyItMatters: "Checks whether the retained packet still supports concise thread summaries."
  },
  {
    benchmarkId: "bc3-thread-summary",
    datasetId: "bc3",
    name: "BC3 Thread Summary",
    task: "summarization",
    homepage: "https://www.cs.ubc.ca/labs/lci/bc3/download.html",
    primaryMetrics: ["salient_sentence_recall", "decision_recall", "summary_precision"],
    whyItMatters: "Useful for evaluating whether the policy keeps the few sentences that matter."
  },
  {
    benchmarkId: "radar-action-items",
    datasetId: "radar-action-items",
    name: "RADAR Action Items",
    task: "action_items",
    homepage: "https://www.cs.cmu.edu/~pbennett/action-item-dataset.html",
    primaryMetrics: ["owner_recall", "commitment_recall", "next_action_precision"],
    whyItMatters: "Evaluates whether work-email handoffs keep owners, commitments, and next actions."
  },
  {
    benchmarkId: "mailex-event-extraction",
    datasetId: "enron-email",
    name: "MailEx Event Extraction",
    task: "event_extraction",
    homepage: "https://github.com/salokr/Email-Event-Extraction",
    primaryMetrics: ["event_trigger_recall", "argument_slot_recall", "temporal_signal_recall"],
    whyItMatters: "Tests whether event-bearing details survive compression in conversational email threads."
  },
  {
    benchmarkId: "enronsr-reply-alignment",
    datasetId: "enron-email",
    name: "EnronSR Reply Alignment",
    task: "reply_alignment",
    homepage: "https://sel.sise.bgu.ac.il/assets/pubs/enron-sr-icwsm-2024.pdf",
    primaryMetrics: ["reply_goal_alignment", "style_alignment", "response_actionability"],
    whyItMatters: "Checks whether the packet preserves enough context to drive a high-quality reply."
  }
];

export function listEmailBenchmarkDefinitions() {
  return [...emailBenchmarkRegistry];
}

export function getEmailBenchmarkDefinition(benchmarkId: string) {
  return emailBenchmarkRegistry.find((entry) => entry.benchmarkId === benchmarkId) ?? null;
}
