export type OAuthProviderId = "gmail" | "outlook";
export type ConnectProviderId = OAuthProviderId | "imap" | "qq" | "icloud" | "yahoo" | "163" | "126" | "forward";

export interface OAuthProviderMetadata {
  id: OAuthProviderId;
  displayName: string;
  aliases: string[];
  accountProvider: "gmail" | "imap";
}

export interface ConnectProviderGuide {
  id: ConnectProviderId;
  displayName: string;
  aliases: string[];
  accountProvider: "gmail" | "imap" | "forward";
  mailboxDomains: string[];
  setupKind: "browser_oauth" | "app_password" | "forward_ingest";
  preset?: {
    imapHost: string;
    imapPort: number;
    imapSecure: boolean;
    imapMailbox?: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
  };
  login?: {
    emailFirst: boolean;
    credentialLabel: string;
    credentialHint: string;
    setupUrl?: string;
    steps: string[];
  };
  web?: {
    loginUrl?: string;
    signupUrl?: string;
    settingsUrl?: string;
  };
  authApi?: {
    startPath: string;
    callbackPath?: string;
    browserRedirectMethod?: "GET";
    programmaticMethod?: "POST";
    querySecretPolicy?: "forbidden" | "not_applicable";
  };
  recommendedCommand: string;
  commands: string[];
  inboundModes: string[];
  outboundModes: string[];
  requiredEnvVars: string[];
  optionalEnvVars: string[];
  notes: string[];
}

export interface ConnectDiscovery {
  api: {
    providersPath: string;
    providerDetailPathTemplate: string;
    onboardingPath: string;
    providerDiscoveryPath: string;
    oauthStartPathTemplate: string;
    oauthCallbackPathTemplate: string;
  };
  supportedOAuthProviders: OAuthProviderMetadata[];
  providerCount: number;
}

export interface ConnectProviderDiscoveryResult {
  emailAddress: string;
  domain: string;
  source: "preset" | "domain_autoconfig" | "domain_well_known" | "ispdb" | "generic";
  confidence: "high" | "medium";
  displayName: string;
  provider: Pick<
    ConnectProviderGuide,
    "id" | "displayName" | "accountProvider" | "setupKind" | "recommendedCommand"
  >;
  preset: ConnectProviderGuide["preset"] | null;
  login: ConnectProviderGuide["login"] | null;
  web: ConnectProviderGuide["web"] | null;
  notes: string[];
}

export interface ConnectOnboardingPlan {
  input: {
    emailAddress?: string;
    providerHint?: string;
    domain?: string;
    accountIdSuggestion: string;
    displayNameSuggestion?: string;
  };
  recommendation: {
    provider: ConnectProviderGuide;
    confidence: "high" | "medium";
    matchReason: "provider_hint" | "email_domain" | "default_generic";
  };
  alternatives: Array<Pick<ConnectProviderGuide, "id" | "displayName" | "setupKind" | "accountProvider">>;
  commands: {
    inspectProviders: string;
    inspectProvider: string;
    login: string;
    observeAccounts: string;
    observeWorkbench: string;
    observeInboxes: string;
  };
  console: {
    browserPath: string;
    workbenchApiPath: string;
  };
  migration: {
    openClawUsers: {
      startCommand: string;
      inspectRuntime: string;
      inspectWorkbench: string;
      notes: string[];
    };
  };
  checklist: string[];
  notes: string[];
}

export interface KnownMailboxWebProvider {
  id: string;
  displayName: string;
  mailboxDomains: string[];
  web: {
    loginUrl: string;
    signupUrl?: string;
    settingsUrl?: string;
  };
  connectProviderId?: ConnectProviderId;
  notes: string[];
}

const MAILCTL_CMD = "mailclaws";
const CONNECT_DISCOVERY_TIMEOUT_MS = 4000;

const CONNECT_PROVIDER_GUIDES: ConnectProviderGuide[] = [
  {
    id: "gmail",
    displayName: "Gmail",
    aliases: ["gmail", "google", "googlemail"],
    accountProvider: "imap",
    mailboxDomains: ["gmail.com", "googlemail.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "imap.gmail.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.gmail.com",
      smtpPort: 465,
      smtpSecure: true
    },
    login: {
      emailFirst: true,
      credentialLabel: "App password",
      credentialHint: "Use a Google app password when the normal mailbox password is rejected.",
      steps: [
        "Open the Google account page and sign in.",
        "Enable 2-Step Verification if the account does not already use it.",
        "Generate an app password for Mail / IMAP, then paste that credential into MailClaws."
      ]
    },
    web: {
      loginUrl: "https://accounts.google.com/",
      signupUrl: "https://accounts.google.com/signup",
      settingsUrl: "https://mail.google.com/"
    },
    recommendedCommand: "mailclaws login gmail <accountId> [displayName]",
    commands: ["mailclaws login gmail <accountId> [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: [
      "Gmail usually needs an app password instead of the normal web password when IMAP/SMTP is enabled.",
      "Use this preset if you want MailClaws to read and send mail through Gmail strictly over IMAP/SMTP.",
      "If Google rejects the mailbox password, generate an app password from the Google Account security settings."
    ]
  },
  {
    id: "outlook",
    displayName: "Outlook",
    aliases: ["outlook", "microsoft", "office365", "hotmail", "live", "msn"],
    accountProvider: "imap",
    mailboxDomains: ["outlook.com", "hotmail.com", "live.com", "msn.com", "office365.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "outlook.office365.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.office365.com",
      smtpPort: 587,
      smtpSecure: false
    },
    login: {
      emailFirst: true,
      credentialLabel: "Mailbox password or app password",
      credentialHint: "Try the normal mailbox password first. If Microsoft rejects it, use the provider-issued app password or mailbox authorization credential.",
      steps: [
        "Open Outlook on the web or the Microsoft account page.",
        "Confirm the mailbox can sign in on the web first.",
        "Use the mailbox password in MailClaws, or switch to the provider-issued app password if IMAP/SMTP rejects the normal password."
      ]
    },
    web: {
      loginUrl: "https://outlook.office.com/mail/",
      signupUrl: "https://signup.live.com/",
      settingsUrl: "https://outlook.office.com/mail/"
    },
    recommendedCommand: "mailclaws login outlook <accountId> [displayName]",
    commands: ["mailclaws login outlook <accountId> [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: [
      "Outlook and Microsoft 365 connect here through IMAP/SMTP only.",
      "If the normal mailbox password is rejected, use a provider-issued app password or mailbox-specific authorization credential."
    ]
  },
  {
    id: "qq",
    displayName: "QQ Mail",
    aliases: ["qq"],
    accountProvider: "imap",
    mailboxDomains: ["qq.com", "foxmail.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "imap.qq.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.qq.com",
      smtpPort: 465,
      smtpSecure: true
    },
    login: {
      emailFirst: true,
      credentialLabel: "Authorization code",
      credentialHint: "QQ Mail usually rejects the web password for IMAP/SMTP. Use the mailbox authorization code instead.",
      steps: [
        "Open QQ Mail on the web.",
        "Generate the mailbox authorization code from the account settings.",
        "Paste that authorization code into MailClaws."
      ]
    },
    web: {
      loginUrl: "https://mail.qq.com/",
      signupUrl: "https://zc.qq.com/",
      settingsUrl: "https://mail.qq.com/"
    },
    recommendedCommand: "mailclaws login qq [accountId] [displayName]",
    commands: ["mailclaws login qq [accountId] [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: [
      "QQ Mail usually requires the mailbox authorization code instead of the web password.",
      "Browser OAuth is not wired for QQ Mail in this repo; use the IMAP/SMTP preset path."
    ]
  },
  {
    id: "icloud",
    displayName: "iCloud Mail",
    aliases: ["icloud", "me", "mac"],
    accountProvider: "imap",
    mailboxDomains: ["icloud.com", "me.com", "mac.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "imap.mail.me.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.mail.me.com",
      smtpPort: 587,
      smtpSecure: false
    },
    login: {
      emailFirst: true,
      credentialLabel: "App-specific password",
      credentialHint: "iCloud Mail usually needs an Apple app-specific password for IMAP/SMTP access.",
      steps: [
        "Open the Apple account page and confirm the mailbox works on the web.",
        "Generate an app-specific password for Mail.",
        "Paste that app-specific password into MailClaws."
      ]
    },
    web: {
      loginUrl: "https://www.icloud.com/mail/",
      signupUrl: "https://account.apple.com/account",
      settingsUrl: "https://www.icloud.com/mail/"
    },
    recommendedCommand: "mailclaws login icloud [accountId] [displayName]",
    commands: ["mailclaws login icloud [accountId] [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: [
      "iCloud usually needs an app-specific password generated from Apple ID settings.",
      "Use this preset when you want MailClaws to receive and send mail through iCloud over IMAP/SMTP."
    ]
  },
  {
    id: "yahoo",
    displayName: "Yahoo Mail",
    aliases: ["yahoo"],
    accountProvider: "imap",
    mailboxDomains: ["yahoo.com", "yahoo.co.jp", "yahoo.co.uk", "ymail.com", "rocketmail.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "imap.mail.yahoo.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.mail.yahoo.com",
      smtpPort: 465,
      smtpSecure: true
    },
    login: {
      emailFirst: true,
      credentialLabel: "Mailbox password or app password",
      credentialHint: "Yahoo Mail often uses app passwords for IMAP/SMTP access.",
      steps: [
        "Open Yahoo Mail on the web.",
        "Confirm the mailbox can sign in on the web first.",
        "Use the mailbox password or the Yahoo app password if IMAP/SMTP rejects the normal password."
      ]
    },
    web: {
      loginUrl: "https://mail.yahoo.com/",
      signupUrl: "https://login.yahoo.com/account/create",
      settingsUrl: "https://mail.yahoo.com/"
    },
    recommendedCommand: "mailclaws login yahoo [accountId] [displayName]",
    commands: ["mailclaws login yahoo [accountId] [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: ["Yahoo Mail commonly uses app passwords for IMAP/SMTP access."]
  },
  {
    id: "163",
    displayName: "NetEase 163 Mail",
    aliases: ["163"],
    accountProvider: "imap",
    mailboxDomains: ["163.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "imap.163.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.163.com",
      smtpPort: 465,
      smtpSecure: true
    },
    login: {
      emailFirst: true,
      credentialLabel: "Authorization code",
      credentialHint: "163 Mail usually needs the provider authorization code instead of the normal mailbox password.",
      steps: [
        "Open 163 Mail on the web.",
        "Generate or retrieve the mailbox authorization code from settings.",
        "Paste that authorization code into MailClaws."
      ]
    },
    web: {
      loginUrl: "https://mail.163.com/",
      signupUrl: "https://zc.reg.163.com/",
      settingsUrl: "https://mail.163.com/"
    },
    recommendedCommand: "mailclaws login 163 [accountId] [displayName]",
    commands: ["mailclaws login 163 [accountId] [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: ["Use the provider authorization code if the normal mailbox password is rejected."]
  },
  {
    id: "126",
    displayName: "NetEase 126 Mail",
    aliases: ["126"],
    accountProvider: "imap",
    mailboxDomains: ["126.com"],
    setupKind: "app_password",
    preset: {
      imapHost: "imap.126.com",
      imapPort: 993,
      imapSecure: true,
      imapMailbox: "INBOX",
      smtpHost: "smtp.126.com",
      smtpPort: 465,
      smtpSecure: true
    },
    login: {
      emailFirst: true,
      credentialLabel: "Authorization code",
      credentialHint: "126 Mail usually needs the provider authorization code instead of the normal mailbox password.",
      steps: [
        "Open 126 Mail on the web.",
        "Generate or retrieve the mailbox authorization code from settings.",
        "Paste that authorization code into MailClaws."
      ]
    },
    web: {
      loginUrl: "https://mail.126.com/",
      signupUrl: "https://zc.reg.163.com/",
      settingsUrl: "https://mail.126.com/"
    },
    recommendedCommand: "mailclaws login 126 [accountId] [displayName]",
    commands: ["mailclaws login 126 [accountId] [displayName]"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: ["Use the provider authorization code if the normal mailbox password is rejected."]
  },
  {
    id: "imap",
    displayName: "Generic IMAP/SMTP",
    aliases: ["imap", "password", "generic", "custom"],
    accountProvider: "imap",
    mailboxDomains: [],
    setupKind: "app_password",
    login: {
      emailFirst: true,
      credentialLabel: "Mailbox password / app password / authorization code",
      credentialHint: "Start with the mailbox password. If the provider rejects it, return with the app password or mailbox authorization code.",
      steps: [
        "Enter the mailbox address first so MailClaws can suggest common host defaults.",
        "If the provider is not preconfigured, fill in the IMAP/SMTP hosts manually.",
        "Use the mailbox password first, then switch to the provider-specific app password or authorization code if needed."
      ]
    },
    recommendedCommand: "mailclaws login [imap|password]",
    commands: ["mailclaws login", "mailclaws login imap", "mailclaws login password"],
    inboundModes: ["imap_watch"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: [
      "Use this path for mailbox providers that expose IMAP/SMTP but are not hard-coded as a preset.",
      "The interactive wizard asks for IMAP host, SMTP host, ports, and credentials."
    ]
  },
  {
    id: "forward",
    displayName: "Forward / raw MIME fallback",
    aliases: ["forward", "raw", "mime", "rfc822"],
    accountProvider: "forward",
    mailboxDomains: [],
    setupKind: "forward_ingest",
    recommendedCommand: "POST /api/accounts { provider: \"forward\" } + POST /api/inbound/raw",
    commands: [
      "curl -X POST /api/accounts -d '{\"provider\":\"forward\",...}'",
      "curl -X POST /api/inbound/raw?processImmediately=true -d '{\"accountId\":\"...\",\"rawMime\":\"...\"}'"
    ],
    inboundModes: ["raw_mime_forward"],
    outboundModes: ["account_smtp"],
    requiredEnvVars: [],
    optionalEnvVars: [],
    notes: [
      "Create or update the account through POST /api/accounts, then send RFC822 content to POST /api/inbound/raw.",
      "Use this when the mailbox app can forward RFC822 mail to MailClaws but does not have a direct first-party provider adapter here.",
      "Forward mode keeps MailClaws provider-agnostic while still letting the room kernel, outbox, and virtual mail plane stay in control."
    ]
  }
];

const EXTRA_KNOWN_MAILBOX_WEB_PROVIDERS: KnownMailboxWebProvider[] = [
  {
    id: "proton",
    displayName: "Proton Mail",
    mailboxDomains: ["proton.me", "protonmail.com", "pm.me"],
    web: {
      loginUrl: "https://account.proton.me/",
      signupUrl: "https://account.proton.me/signup",
      settingsUrl: "https://mail.proton.me/"
    },
    notes: [
      "Proton Mail web sign-in is handled through Proton Account.",
      "If you want to connect Proton Mail to MailClaws, use the generic IMAP path and the provider-generated mailbox password/app password."
    ]
  },
  {
    id: "zoho",
    displayName: "Zoho Mail",
    mailboxDomains: ["zohomail.com", "zoho.com"],
    web: {
      loginUrl: "https://www.zoho.com/mail/signin.html",
      signupUrl: "https://www.zoho.com/mail/zohomail-pricing.html",
      settingsUrl: "https://mail.zoho.com/"
    },
    notes: [
      "Zoho Mail sign-in uses the Zoho account login page.",
      "MailClaws currently falls back to the generic IMAP path for Zoho Mail."
    ]
  },
  {
    id: "aol",
    displayName: "AOL Mail",
    mailboxDomains: ["aol.com"],
    web: {
      loginUrl: "https://mail.aol.com/",
      signupUrl: "https://mail.aol.com/",
      settingsUrl: "https://mail.aol.com/"
    },
    notes: [
      "AOL Mail exposes a webmail login flow from the official AOL Mail homepage.",
      "MailClaws currently falls back to the generic IMAP path for AOL Mail."
    ]
  },
  {
    id: "gmx",
    displayName: "GMX Mail",
    mailboxDomains: ["gmx.com", "gmx.us", "gmx.de", "gmx.net", "gmx.co.uk"],
    web: {
      loginUrl: "https://www.gmx.com/",
      signupUrl: "https://www.gmx.com/mail/",
      settingsUrl: "https://www.gmx.com/"
    },
    notes: [
      "GMX webmail is exposed from the official GMX homepage.",
      "MailClaws currently falls back to the generic IMAP path for GMX Mail."
    ]
  },
  {
    id: "mail-com",
    displayName: "mail.com",
    mailboxDomains: ["mail.com"],
    web: {
      loginUrl: "https://www.mail.com/",
      signupUrl: "https://support.mail.com/account/login-details/register.html",
      settingsUrl: "https://www.mail.com/"
    },
    notes: [
      "mail.com account registration is documented on the official help site.",
      "MailClaws currently falls back to the generic IMAP path for mail.com."
    ]
  },
  {
    id: "yandex",
    displayName: "Yandex Mail",
    mailboxDomains: ["yandex.com", "yandex.ru", "ya.ru"],
    web: {
      loginUrl: "https://mail.yandex.com/",
      signupUrl: "https://yandex.com/support/yandex-360/customers/mail/en/reg",
      settingsUrl: "https://mail.yandex.com/"
    },
    notes: [
      "Yandex support recommends `mail.yandex.com` for mailbox login.",
      "MailClaws currently falls back to the generic IMAP path for Yandex Mail."
    ]
  },
  {
    id: "fastmail",
    displayName: "Fastmail",
    mailboxDomains: ["fastmail.com", "fastmail.fm"],
    web: {
      loginUrl: "https://app.fastmail.com/",
      signupUrl: "https://www.fastmail.com/signup/",
      settingsUrl: "https://app.fastmail.com/"
    },
    notes: [
      "Fastmail webmail is available from the official Fastmail app URL.",
      "MailClaws currently falls back to the generic IMAP path for Fastmail."
    ]
  }
];

const OAUTH_PROVIDERS: OAuthProviderMetadata[] = [
  {
    id: "gmail",
    displayName: "Gmail",
    aliases: ["gmail", "google", "googlemail"],
    accountProvider: "gmail"
  },
  {
    id: "outlook",
    displayName: "Outlook",
    aliases: ["outlook", "microsoft", "office365", "hotmail", "live", "msn"],
    accountProvider: "imap"
  }
];

export function listConnectProviderGuides() {
  return CONNECT_PROVIDER_GUIDES.map((guide) => ({
    ...guide,
    ...(guide.preset
      ? {
          preset: {
            ...guide.preset
          }
        }
      : {}),
    ...(guide.login
      ? {
          login: {
            ...guide.login,
            steps: [...guide.login.steps]
          }
        }
      : {}),
    ...(guide.authApi
      ? {
          authApi: {
            ...guide.authApi
          }
        }
      : {}),
    aliases: [...guide.aliases],
    mailboxDomains: [...guide.mailboxDomains],
    commands: [...guide.commands],
    inboundModes: [...guide.inboundModes],
    outboundModes: [...guide.outboundModes],
    requiredEnvVars: [...guide.requiredEnvVars],
    optionalEnvVars: [...guide.optionalEnvVars],
    notes: [...guide.notes],
    ...(guide.web
      ? {
          web: {
            ...guide.web
          }
        }
      : {})
  }));
}

export function resolveConnectProviderGuide(provider: string | undefined) {
  const normalized = provider?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const guide = CONNECT_PROVIDER_GUIDES.find(
    (entry) => entry.id === normalized || entry.aliases.includes(normalized)
  );
  return guide
      ? {
        ...guide,
        ...(guide.preset
          ? {
              preset: {
                ...guide.preset
              }
            }
          : {}),
        ...(guide.login
          ? {
              login: {
                ...guide.login,
                steps: [...guide.login.steps]
              }
            }
          : {}),
        ...(guide.authApi
          ? {
              authApi: {
                ...guide.authApi
              }
            }
          : {}),
        aliases: [...guide.aliases],
        mailboxDomains: [...guide.mailboxDomains],
        commands: [...guide.commands],
        inboundModes: [...guide.inboundModes],
        outboundModes: [...guide.outboundModes],
        requiredEnvVars: [...guide.requiredEnvVars],
        optionalEnvVars: [...guide.optionalEnvVars],
        notes: [...guide.notes],
        ...(guide.web
          ? {
              web: {
                ...guide.web
              }
            }
          : {})
      }
    : null;
}

export function resolveOAuthProvider(provider: string | undefined) {
  const normalized = provider?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return OAUTH_PROVIDERS.find((entry) => entry.aliases.includes(normalized)) ?? null;
}

export function isPasswordPresetProvider(provider: string | undefined) {
  return Boolean(getPasswordPresetProvider(provider));
}

export function getPasswordPresetProvider(provider: string | undefined) {
  const guide = resolveConnectProviderGuide(provider);
  if (!guide || guide.setupKind !== "app_password") {
    return undefined;
  }
  return guide.id;
}

export function getConnectDiscovery(): ConnectDiscovery {
  return {
    api: {
      providersPath: "/api/connect/providers",
      providerDetailPathTemplate: "/api/connect/providers/:provider",
      onboardingPath: "/api/connect/onboarding",
      providerDiscoveryPath: "/api/connect/discover",
      oauthStartPathTemplate: "/api/auth/:provider/start",
      oauthCallbackPathTemplate: "/api/auth/:provider/callback"
    },
    supportedOAuthProviders: [],
    providerCount: CONNECT_PROVIDER_GUIDES.length
  };
}

export function listKnownMailboxWebProviders() {
  const merged = [
    ...CONNECT_PROVIDER_GUIDES.flatMap((guide) =>
      guide.web?.loginUrl && guide.mailboxDomains.length > 0
        ? [
            {
              id: guide.id,
              displayName: guide.displayName,
              mailboxDomains: [...guide.mailboxDomains],
              web: {
                loginUrl: guide.web.loginUrl,
                ...(guide.web.signupUrl ? { signupUrl: guide.web.signupUrl } : {}),
                ...(guide.web.settingsUrl ? { settingsUrl: guide.web.settingsUrl } : {})
              },
              connectProviderId: guide.id,
              notes: [...guide.notes]
            } satisfies KnownMailboxWebProvider
          ]
        : []
    ),
    ...EXTRA_KNOWN_MAILBOX_WEB_PROVIDERS.map((provider) => ({
      ...provider,
      mailboxDomains: [...provider.mailboxDomains],
      web: {
        ...provider.web
      },
      notes: [...provider.notes]
    }))
  ];

  return merged.filter(
    (provider, index, array) => array.findIndex((candidate) => candidate.id === provider.id) === index
  );
}

export function resolveKnownMailboxWebProviderByEmailAddress(emailAddress: string | undefined) {
  const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
  const domain = normalizedEmailAddress?.split("@")[1]?.trim().toLowerCase();
  if (!domain) {
    return null;
  }

  return (
    listKnownMailboxWebProviders().find((provider) => provider.mailboxDomains.includes(domain)) ?? null
  );
}

export function resolveConnectProviderByEmailAddress(emailAddress: string | undefined) {
  const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
  const domain = normalizedEmailAddress?.split("@")[1]?.trim().toLowerCase();
  if (!domain) {
    return resolveConnectProviderGuide("imap");
  }
  return resolveConnectProviderGuide(resolveConnectProviderByDomain(domain));
}

export async function discoverConnectProvider(
  input: {
    emailAddress?: string;
    fetchImpl?: typeof fetch;
  }
): Promise<ConnectProviderDiscoveryResult | null> {
  const normalizedEmailAddress = input.emailAddress?.trim().toLowerCase();
  const domain = normalizedEmailAddress?.split("@")[1]?.trim().toLowerCase();
  if (!normalizedEmailAddress || !domain) {
    return null;
  }

  const knownGuide = resolveConnectProviderByEmailAddress(normalizedEmailAddress);
  if (knownGuide && knownGuide.id !== "imap" && knownGuide.id !== "forward") {
    return buildDiscoveryResultFromGuide({
      emailAddress: normalizedEmailAddress,
      domain,
      guide: knownGuide,
      source: "preset",
      confidence: "high"
    });
  }

  const fetchImpl = input.fetchImpl ?? fetch;
  const discoveredConfig = await discoverAutoconfigProfile({
    emailAddress: normalizedEmailAddress,
    domain,
    fetchImpl
  });
  if (discoveredConfig) {
    return buildDiscoveryResultFromAutoconfig({
      emailAddress: normalizedEmailAddress,
      domain,
      config: discoveredConfig
    });
  }

  const genericGuide = resolveConnectProviderGuide("imap");
  if (!genericGuide) {
    return null;
  }

  return buildDiscoveryResultFromGuide({
    emailAddress: normalizedEmailAddress,
    domain,
    guide: genericGuide,
    source: "generic",
    confidence: "medium"
  });
}

export function getUnsupportedOAuthProviderMessage(provider: string | undefined) {
  const normalized = provider?.trim().toLowerCase();
  if (!normalized) {
    return "browser OAuth login is disabled in this build; use `mailclaws login` for the IMAP/SMTP path";
  }
  const guide = resolveConnectProviderGuide(normalized);
  if (guide) {
    return `Browser OAuth login is disabled for ${guide.displayName}; use \`mailclaws login ${guide.id}\` or \`mailclaws login you@example.com\` for the IMAP/SMTP path.`;
  }
  return "Browser OAuth login is disabled here; use `mailclaws login` or inspect `mailclaws connect providers` for IMAP/SMTP setup guidance.";
}

export function buildConnectOnboardingPlan(input: {
  emailAddress?: string;
  providerHint?: string;
} = {}): ConnectOnboardingPlan {
  const normalizedEmailAddress = input.emailAddress?.trim().toLowerCase() || undefined;
  const domain = normalizedEmailAddress?.split("@")[1]?.trim().toLowerCase() || undefined;
  const providerHint = input.providerHint?.trim().toLowerCase() || undefined;

  const recommendation = resolveOnboardingRecommendation({
    providerHint,
    emailAddress: normalizedEmailAddress,
    domain
  });
  const accountIdSuggestion = normalizedEmailAddress
    ? createSuggestedAccountId(normalizedEmailAddress)
    : "<accountId>";
  const displayNameSuggestion = normalizedEmailAddress
    ? inferSuggestedDisplayName(normalizedEmailAddress)
    : undefined;

  return {
    input: {
      emailAddress: normalizedEmailAddress,
      providerHint,
      domain,
      accountIdSuggestion,
      displayNameSuggestion
    },
    recommendation: {
      provider: recommendation.provider,
      confidence: recommendation.confidence,
      matchReason: recommendation.matchReason
    },
    alternatives: recommendation.alternatives.map((guide) => ({
      id: guide.id,
      displayName: guide.displayName,
      setupKind: guide.setupKind,
      accountProvider: guide.accountProvider
    })),
    commands: {
      inspectProviders: `${MAILCTL_CMD} connect providers`,
      inspectProvider: `${MAILCTL_CMD} connect providers ${recommendation.provider.id}`,
      login: renderOnboardingLoginCommand(recommendation.provider, {
        accountIdSuggestion,
        displayNameSuggestion
      }),
      observeAccounts: `${MAILCTL_CMD} accounts`,
      observeWorkbench:
        accountIdSuggestion === "<accountId>"
          ? `${MAILCTL_CMD} workbench <accountId>`
          : `${MAILCTL_CMD} workbench ${accountIdSuggestion}`,
      observeInboxes:
        accountIdSuggestion === "<accountId>"
          ? `${MAILCTL_CMD} inboxes <accountId>`
          : `${MAILCTL_CMD} inboxes ${accountIdSuggestion}`
    },
    console: {
      browserPath: "/workbench/mail",
      workbenchApiPath: "/api/console/workbench"
    },
    migration: {
      openClawUsers: {
        startCommand:
          "MAILCLAW_FEATURE_OPENCLAW_BRIDGE=true MAILCLAW_FEATURE_MAIL_INGEST=true pnpm dev",
        inspectRuntime: `${MAILCTL_CMD} observe runtime`,
        inspectWorkbench:
          accountIdSuggestion === "<accountId>"
            ? `${MAILCTL_CMD} workbench <accountId>`
            : `${MAILCTL_CMD} workbench ${accountIdSuggestion}`,
        notes: [
          "Keep Gateway/bridge mode enabled first; MailClaws adds room truth, virtual mail, approvals, and replay on top of the OpenClaw substrate.",
          "Do not treat OpenClaw session transcript as MailClaws truth. Inspect rooms, mailbox feeds, and `/workbench/mail` instead."
        ]
      }
    },
    checklist: buildOnboardingChecklist(recommendation.provider, {
      accountIdSuggestion,
      emailAddress: normalizedEmailAddress
    }),
    notes: [...recommendation.provider.notes]
  };
}

function resolveOnboardingRecommendation(input: {
  providerHint?: string;
  emailAddress?: string;
  domain?: string;
}) {
  if (input.providerHint) {
    const provider = resolveConnectProviderGuide(input.providerHint);
    if (provider) {
      return {
        provider,
        confidence: "high" as const,
        matchReason: "provider_hint" as const,
        alternatives: listAlternativeProviders(provider.id)
      };
    }
  }

  if (input.domain) {
    const provider = resolveConnectProviderGuide(resolveConnectProviderByDomain(input.domain));
    if (provider) {
      return {
        provider,
        confidence: provider.id === "imap" ? ("medium" as const) : ("high" as const),
        matchReason: "email_domain" as const,
        alternatives: listAlternativeProviders(provider.id)
      };
    }
  }

  const provider = resolveConnectProviderGuide("imap");
  if (!provider) {
    throw new Error("generic imap provider guide is missing");
  }

  return {
    provider,
    confidence: "medium" as const,
    matchReason: "default_generic" as const,
    alternatives: listAlternativeProviders(provider.id)
  };
}

function resolveConnectProviderByDomain(domain: string) {
  const normalizedDomain = domain.trim().toLowerCase();
  const matched = CONNECT_PROVIDER_GUIDES.find(
    (guide) => guide.id !== "imap" && guide.id !== "forward" && guide.mailboxDomains.includes(normalizedDomain)
  );
  if (matched) {
    return matched.id;
  }
  return "imap";
}

async function discoverAutoconfigProfile(input: {
  emailAddress: string;
  domain: string;
  fetchImpl: typeof fetch;
}) {
  const candidates = [
    {
      source: "domain_autoconfig" as const,
      url: `https://autoconfig.${input.domain}/mail/config-v1.1.xml?emailaddress=${encodeURIComponent(input.emailAddress)}`
    },
    {
      source: "domain_well_known" as const,
      url: `https://${input.domain}/.well-known/autoconfig/mail/config-v1.1.xml?emailaddress=${encodeURIComponent(input.emailAddress)}`
    },
    {
      source: "ispdb" as const,
      url: `https://autoconfig.thunderbird.net/v1.1/${encodeURIComponent(input.domain)}`
    }
  ];

  for (const candidate of candidates) {
    try {
      const response = await input.fetchImpl(candidate.url, {
        headers: {
          accept: "application/xml, text/xml;q=0.9, text/plain;q=0.5, */*;q=0.1"
        },
        redirect: "follow",
        signal: AbortSignal.timeout(CONNECT_DISCOVERY_TIMEOUT_MS)
      });
      if (!response.ok) {
        continue;
      }
      const xml = await response.text();
      const parsed = parseThunderbirdAutoconfigXml(xml);
      if (parsed) {
        return {
          ...parsed,
          source: candidate.source
        };
      }
    } catch {}
  }

  return null;
}

function parseThunderbirdAutoconfigXml(xml: string) {
  if (!xml || !xml.includes("<clientConfig")) {
    return null;
  }

  const incomingServer = findAutoconfigServer(xml, "incomingServer", "imap");
  const outgoingServer = findAutoconfigServer(xml, "outgoingServer", "smtp");
  if (!incomingServer || !outgoingServer) {
    return null;
  }

  const imapPort = Number.parseInt(incomingServer.port || "", 10);
  const smtpPort = Number.parseInt(outgoingServer.port || "", 10);
  if (!incomingServer.hostname || !Number.isFinite(imapPort) || !outgoingServer.hostname || !Number.isFinite(smtpPort)) {
    return null;
  }

  return {
    displayName:
      readAutoconfigTag(xml, "displayShortName") ||
      readAutoconfigTag(xml, "displayName") ||
      readAutoconfigTag(xml, "domain"),
    preset: {
      imapHost: incomingServer.hostname,
      imapPort,
      imapSecure: socketTypeUsesImplicitTls(incomingServer.socketType),
      imapMailbox: "INBOX",
      smtpHost: outgoingServer.hostname,
      smtpPort,
      smtpSecure: socketTypeUsesImplicitTls(outgoingServer.socketType)
    }
  };
}

function findAutoconfigServer(xml: string, tagName: "incomingServer" | "outgoingServer", expectedType: string) {
  const expression = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  for (const match of xml.matchAll(expression)) {
    const attributes = match[1] || "";
    const body = match[2] || "";
    const typeMatch = attributes.match(/\btype=["']([^"']+)["']/i);
    if ((typeMatch?.[1] || "").trim().toLowerCase() !== expectedType) {
      continue;
    }
    return {
      hostname: readAutoconfigTag(body, "hostname"),
      port: readAutoconfigTag(body, "port"),
      socketType: readAutoconfigTag(body, "socketType")
    };
  }
  return null;
}

function readAutoconfigTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return decodeXmlText(match?.[1] || "").trim();
}

function decodeXmlText(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function socketTypeUsesImplicitTls(socketType: string) {
  const normalized = socketType.trim().toUpperCase();
  return normalized === "SSL" || normalized === "SSL/TLS";
}

function buildDiscoveryResultFromGuide(input: {
  emailAddress: string;
  domain: string;
  guide: ConnectProviderGuide;
  source: ConnectProviderDiscoveryResult["source"];
  confidence: ConnectProviderDiscoveryResult["confidence"];
}) {
  const knownWebProvider = resolveKnownMailboxWebProviderByEmailAddress(input.emailAddress);
  return {
    emailAddress: input.emailAddress,
    domain: input.domain,
    source: input.source,
    confidence: input.confidence,
    displayName: input.guide.displayName,
    provider: {
      id: input.guide.id,
      displayName: input.guide.displayName,
      accountProvider: input.guide.accountProvider,
      setupKind: input.guide.setupKind,
      recommendedCommand: input.guide.recommendedCommand
    },
    preset: input.guide.preset
      ? {
          ...input.guide.preset
        }
      : null,
    login: input.guide.login
      ? {
          ...input.guide.login,
          steps: [...input.guide.login.steps]
        }
      : null,
    web: input.guide.web
      ? {
          ...input.guide.web
        }
      : knownWebProvider?.web
        ? {
            ...knownWebProvider.web
          }
        : null,
    notes: [...input.guide.notes]
  } satisfies ConnectProviderDiscoveryResult;
}

function buildDiscoveryResultFromAutoconfig(input: {
  emailAddress: string;
  domain: string;
  config: {
    source: "domain_autoconfig" | "domain_well_known" | "ispdb";
    displayName?: string;
    preset: NonNullable<ConnectProviderGuide["preset"]>;
  };
}) {
  const matchedGuide = resolveConnectProviderGuide(resolveConnectProviderByDomain(input.domain));
  const genericGuide = resolveConnectProviderGuide("imap");
  const guide = matchedGuide && matchedGuide.id !== "forward" ? matchedGuide : genericGuide;
  if (!guide) {
    throw new Error("generic imap provider guide is missing");
  }
  const knownWebProvider = resolveKnownMailboxWebProviderByEmailAddress(input.emailAddress);
  return {
    emailAddress: input.emailAddress,
    domain: input.domain,
    source: input.config.source,
    confidence: input.config.source === "ispdb" ? "medium" : "high",
    displayName:
      input.config.displayName ||
      knownWebProvider?.displayName ||
      (matchedGuide && matchedGuide.id !== "imap" ? matchedGuide.displayName : input.domain),
    provider: {
      id: matchedGuide && matchedGuide.id !== "forward" ? matchedGuide.id : "imap",
      displayName:
        matchedGuide && matchedGuide.id !== "imap"
          ? matchedGuide.displayName
          : input.config.displayName || knownWebProvider?.displayName || "Generic IMAP/SMTP",
      accountProvider: "imap",
      setupKind: "app_password",
      recommendedCommand: guide.recommendedCommand
    },
    preset: {
      ...input.config.preset
    },
    login: guide.login
      ? {
          ...guide.login,
          steps: [...guide.login.steps]
        }
      : null,
    web: knownWebProvider?.web
      ? {
          ...knownWebProvider.web
        }
      : matchedGuide?.web
        ? {
            ...matchedGuide.web
          }
        : null,
    notes: [
      input.config.source === "ispdb"
        ? "Auto-configured from the Thunderbird ISPDB-compatible discovery service."
        : "Auto-configured from the mailbox domain's Thunderbird-compatible autoconfig endpoint.",
      ...(guide.notes ?? [])
    ]
  } satisfies ConnectProviderDiscoveryResult;
}

function listAlternativeProviders(providerId: ConnectProviderId) {
  const alternatives = new Set<ConnectProviderId>();
  if (providerId !== "imap") {
    alternatives.add("imap");
  }
  if (providerId !== "forward") {
    alternatives.add("forward");
  }
  return [...alternatives]
    .map((id) => resolveConnectProviderGuide(id))
    .filter((guide): guide is ConnectProviderGuide => Boolean(guide));
}

function renderOnboardingLoginCommand(
  provider: ConnectProviderGuide,
  input: {
    accountIdSuggestion: string;
    displayNameSuggestion?: string;
  }
) {
  const displayNamePart = input.displayNameSuggestion ? ` "${input.displayNameSuggestion}"` : " [displayName]";
  if (provider.id === "imap") {
    return `${MAILCTL_CMD} login`;
  }
  if (provider.id === "forward") {
    return "curl -X POST http://127.0.0.1:3000/api/accounts -H 'content-type: application/json' -d '{\"provider\":\"forward\",\"accountId\":\"<accountId>\",\"emailAddress\":\"you@example.com\"}'";
  }
  return `${MAILCTL_CMD} login ${provider.id} ${input.accountIdSuggestion}${displayNamePart}`;
}

function buildOnboardingChecklist(
  provider: ConnectProviderGuide,
  input: {
    accountIdSuggestion: string;
    emailAddress?: string;
  }
) {
  const mailboxLabel = input.emailAddress ?? "your mailbox";
  const steps = [
    `Inspect the provider guide with \`${MAILCTL_CMD} connect providers ${provider.id}\`.`,
    `Connect ${mailboxLabel} with \`${renderOnboardingLoginCommand(provider, { accountIdSuggestion: input.accountIdSuggestion, displayNameSuggestion: input.emailAddress ? inferSuggestedDisplayName(input.emailAddress) : undefined })}\`.`,
    "Open `/workbench/mail` and confirm the account shows up under Accounts/Mailboxes.",
    `Send a test email from another mailbox to ${mailboxLabel} and confirm a new room appears.`,
    `Inspect the room and internal agent mail with \`${MAILCTL_CMD} observe workbench ${input.accountIdSuggestion}\` or the browser console.`,
    "Approve or reject any pending outbound draft through the outbox/approval flow instead of expecting direct send from workers."
  ];

  if (provider.id === "forward") {
    steps[1] =
      "Create the forward/raw-MIME account, then configure your mailbox app or provider to forward RFC822 mail into `POST /api/inbound/raw`.";
  }

  return steps;
}

export function createSuggestedAccountId(emailAddress: string) {
  return `acct-${emailAddress
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)}`;
}

export function inferSuggestedDisplayName(emailAddress: string) {
  return emailAddress.split("@")[0]?.trim() || emailAddress;
}
