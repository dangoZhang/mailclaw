import { describe, expect, it } from "vitest";

import {
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
});
