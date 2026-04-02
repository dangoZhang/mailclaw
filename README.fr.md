# MailClaws

<p align="center">
  Email multi-agent. Collaboration visible. Contexte traçable. Prompts plus légers.
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.fr.md"><strong>Français</strong></a>
</p>

<p align="center">
  <a href="https://dangozhang.github.io/mailclaw/">Site</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/ci.yml">CI</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/release.yml">Release</a>
</p>

<p align="center">
  <img src="./docs/public/mailclaws-poster.svg" alt="Affiche MailClaws : une vraie scène de travail email avec une boîte publique en façade, plusieurs agents spécialistes derrière, et des mails internes visibles autour d’une même room." width="960" />
</p>

MailClaws transforme l’email en couche de collaboration pour un travail multi-agent à la manière d’OpenClaw.

Il convient particulièrement à :

- celles et ceux qui travaillent déjà par email
- les utilisateurs d’OpenClaw
- les longs fils de conversation
- les changements fréquents de contexte
- les tâches qui demandent d’abord un point d’avancement, puis une réponse finale
- les équipes qui veulent plusieurs agents sans perdre le contrôle du contexte

## Pourquoi C’est Plus Simple

Beaucoup d’outils cachent la collaboration. MailClaws la montre.

- Vous partez d’une vraie boîte mail que vous utilisez déjà.
- Vous pouvez recevoir un email après une tâche longue.
- Vous pouvez lire le rapport complet, pas seulement la dernière phrase.
- Vous voyez comment plusieurs agents partagent l’information.
- Vous retrouvez l’expérience familière d’OpenClaw, avec le mail comme onglet natif.

## Pourquoi L’Email Convient Naturellement

L’email a déjà la bonne forme.

- frontières de contexte claires
- historique traçable
- fils faciles à partager
- taille naturelle des messages
- habitudes de travail déjà acquises
- aucun nouveau protocole à apprendre

MailClaws part de ce que les utilisateurs connaissent déjà.

## Ce Que Vous Obtenez Vraiment

- Un agent public tient la boîte d’entrée pendant que des agents spécialistes collaborent derrière.
- La collaboration interne reste visible grâce aux boîtes virtuelles, aux work threads et au courrier interne rejouable.
- Les longs fils consomment moins, car les agents gardent un état compact en forme de mail au lieu de traîner tout le transcript.
- Le multi-agent reste plus léger, car les agents échangent des mails et des références au lieu de recopier d’énormes prompts.
- Les rooms pilotent ACK, progression, review, approval et envoi final dans un seul flux.
- Le Workbench montre qui a reçu quoi, qui a répondu, quel draft a gagné et où quelque chose a été bloqué.
- Les subagents burst restent des workers de calcul. Les agents durables gardent leur propre `SOUL.md`, leur identité de mailbox et leur frontière mémoire.

## Installez-Le Comme Vous Voulez

```bash
npm install -g mailclaws
```

```bash
pnpm setup && pnpm add -g mailclaws
```

```bash
brew install mailclaws
```

Vous pouvez aussi lancer directement `./install.sh`.

## Trois Minutes Pour Recevoir Le Premier Email D’Agent

```bash
./install.sh
MAILCLAW_FEATURE_MAIL_INGEST=true mailclaws
```

Ouvrez un second terminal :

```bash
mailclaws onboard you@example.com
mailclaws login
mailclaws dashboard
```

Puis faites ceci :

1. Connectez n’importe quelle boîte mail que vous utilisez déjà.
2. Envoyez-lui un email de test depuis une autre boîte.
3. Ouvrez le Workbench et cliquez sur `Mail`.
4. Regardez la room apparaître, la collaboration interne démarrer et la chaîne de réponse se former.
5. Laissez l’outbox gouvernée vous envoyer la première vraie réponse.

Si vous préférez commencer par une démo locale sûre, lancez `pnpm demo:mail`, puis ouvrez `http://127.0.0.1:3020/workbench/mail`.

## Vous Utilisez Déjà OpenClaw ?

- Gardez vos habitudes Gateway et Workbench.
- Lancez `mailclaws dashboard`, connectez-vous, puis cliquez sur l’onglet `Mail`.
- Il n’y a pas une nouvelle coque à réapprendre. MailClaws ajoute rooms, mail et collaboration multi-agent dans la même surface.
- Si vous voulez la route de secours directe, lancez `mailclaws open`.

## Modèles Pour Démarrer Vite

Les modèles existent pour une raison : démarrer plus vite en multi-agent.

- `One-Person Company` : un front desk et des rôles spécialistes en back-office. Le modèle suit l’esprit popularisé par <https://github.com/cyfyifanchen/one-person-company>, mais MailClaws en fait de vrais agents durables avec mailboxes et collaboration visible.
- `Three Provinces, Six Departments` : une équipe plus large, plus gouvernée, alignée sur la structure de <https://github.com/cft0808/edict>.

Les définitions de modèles sont ici :

- <https://github.com/dangoZhang/mailclaw/blob/main/src/agents/templates.ts>

## Site Et Workbench

- Site : <https://dangozhang.github.io/mailclaw/>
- Workbench : lancez `mailclaws dashboard`, connectez-vous, puis cliquez sur `Mail`

Le site explique le modèle.  
Le Workbench vous montre le système en action.

## Licence

MIT. Voir [LICENSE](./LICENSE).
