import { describe, expect, it, vi } from "vitest";

import { discoverMailboxProfile } from "../src/auth/mailbox-autoconfig.js";

describe("mailbox autoconfig", () => {
  it("returns the built-in Gmail preset without network discovery", async () => {
    const fetchMock = vi.fn();

    const profile = await discoverMailboxProfile({
      emailAddress: "person@gmail.com",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    expect(profile).toMatchObject({
      imapHost: "imap.gmail.com",
      imapPort: 993,
      imapSecure: true,
      smtpHost: "smtp.gmail.com",
      smtpPort: 465,
      smtpSecure: true,
      source: "preset"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("discovers IMAP and SMTP settings from Thunderbird-style autoconfig XML", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="custom.example">
    <incomingServer type="imap">
      <hostname>imap.custom.example</hostname>
      <port>993</port>
      <socketType>SSL</socketType>
      <username>%EMAILLOCALPART%</username>
      <authentication>password-cleartext</authentication>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>smtp.custom.example</hostname>
      <port>587</port>
      <socketType>STARTTLS</socketType>
      <username>%EMAILADDRESS%</username>
      <authentication>password-cleartext</authentication>
    </outgoingServer>
  </emailProvider>
</clientConfig>`;

    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.startsWith("https://autoconfig.custom.example/")) {
        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "application/xml"
          }
        });
      }
      return new Response("not found", { status: 404 });
    });

    const profile = await discoverMailboxProfile({
      emailAddress: "person@custom.example",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    expect(profile).toMatchObject({
      imapHost: "imap.custom.example",
      imapPort: 993,
      imapSecure: true,
      imapUsername: "person",
      smtpHost: "smtp.custom.example",
      smtpPort: 587,
      smtpSecure: false,
      smtpUsername: "person@custom.example",
      source: "autoconfig_subdomain"
    });
  });

  it("falls back to Thunderbird ISPDB when the domain does not host its own autoconfig file", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="example.org">
    <incomingServer type="imap">
      <hostname>imap.example.org</hostname>
      <port>993</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
      <authentication>password-cleartext</authentication>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>smtp.example.org</hostname>
      <port>465</port>
      <socketType>SSL</socketType>
      <username>%EMAILADDRESS%</username>
      <authentication>password-cleartext</authentication>
    </outgoingServer>
  </emailProvider>
</clientConfig>`;

    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.includes("autoconfig.thunderbird.net")) {
        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "text/xml"
          }
        });
      }
      return new Response("not found", { status: 404 });
    });

    const profile = await discoverMailboxProfile({
      emailAddress: "user@example.org",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    expect(profile).toMatchObject({
      imapHost: "imap.example.org",
      smtpHost: "smtp.example.org",
      source: "ispdb"
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
