# MailClaw

<p align="center">
  更省 token、更适合多会话切换、更适合多智能体协作的邮件原生智能体系统。
</p>

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.zh-CN.md"><strong>简体中文</strong></a> ·
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <a href="https://dangozhang.github.io/mailclaw/">文档</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/ci.yml">CI</a> ·
  <a href="https://github.com/dangoZhang/mailclaw/actions/workflows/release.yml">Release</a>
</p>

MailClaw 不只是给“邮件工作者”准备的，它更适合那些已经感受到通用智能体工作台痛点的团队：上下文越滚越长、会话切换越来越重、长任务中途难汇报、多智能体协作过程看不见。

它把一封封真实邮件会话变成可持续处理的工作对象。每条会话都有自己的真相源，内部协作是可见的，草稿可以审阅，外发可以审批，事后还能回放。

## 为什么 MailClaw 比 OpenClaw 更强

OpenClaw 是很强的通用智能体工作台。MailClaw 则是针对它在真实会话处理上的痛点，专门做过收口。

- OpenClaw 更偏向会话驱动，MailClaw 更偏向房间驱动，一条邮件线程就是一个持久真相源。
- OpenClaw 里的子智能体结果常常藏在一次运行里，MailClaw 会把内部协作显式展示成可检查的内部邮件。
- OpenClaw 容易把越来越长的上下文一路往后拖，MailClaw 只保留精炼后的预摘要状态，后续轮次更稳、更省。
- OpenClaw 更像单次任务工作台，MailClaw 更适合在很多条会话之间来回切换，而不把每个历史上下文都重新背上。
- OpenClaw 往往只展示“最后做了什么”，MailClaw 更强调长任务过程中的汇报、审批、回放和接力。
- OpenClaw 给你一个通用工作台，MailClaw 给你一个真正围绕邮件工作的 `Mail` 标签页。

如果你的日常工作经常从这些句子开始：

- “客户发来一封邮件”
- “创始人邮箱今天炸了”
- “这封信需要多个智能体一起处理”
- “发出去之前必须有人把关”

那 MailClaw 会比通用工作台更顺手。

## 它真正不一样的地方

- 真实邮件线程会沉淀成持久房间，而不是一次性的聊天状态。
- 多智能体协作通过虚拟邮件完成，而不是共享一锅越来越大的上下文。
- 长期记忆保留的是摘要、事实、决策和承诺，不是临时推理碎片。
- 长任务可以先确认收到、再持续汇报、最后再形成最终回复，不需要把“中间状态”塞进另一套系统。
- 真实外发默认要经过审阅、审批和发件箱治理链路。
- 运维人员可以从同一个界面看清入站、内部协作、审批、投递和回放。

## 为什么它更省 Token

MailClaw 会主动把上下文做小。它不会默认每轮都把整段会话重新灌进模型，而是把真正值得留下来的结果压成预摘要，只在必要时按引用回拉旧内容。

仓库内基准测试 `tests/prompt-footprint-benchmark.test.ts` 的当前结果：

- 长线程后续回复平均：`755` 对 `2006`，估算下降 `62.3%`
- 第 6 轮后续回复：`752` 对 `2868`，估算下降 `73.8%`
- 5 个工作智能体汇总回主智能体：`750` 对 `3444`，估算下降 `78.2%`

这直接影响三个用户体验：

- 会话切换更轻
- 长任务汇报更稳
- 多智能体合作时主智能体不用反复重读所有子过程

## 现在就能做什么

- 登录一个真实邮箱并接收真实邮件
- 在 `Mail` 标签页里查看账号、会话房间、协作邮箱和审批
- 让多个智能体一起处理同一封邮件，同时保持外部线程干净
- 在长任务过程中先发确认、再发进度、最后发结论
- 看清某个草稿为什么被通过、被打回或被新回复覆盖
- 事后回放一条会话为什么会得到当前结果
- 作为 OpenClaw 风格宿主里的一个邮件标签页使用，而不是另开一套系统

## 三分钟跑通第一封邮件

```bash
./install.sh
MAILCLAW_FEATURE_MAIL_INGEST=true mailclaw
```

再开一个终端：

```bash
mailclaw onboard you@example.com
mailclaw login
mailclaw dashboard
```

推荐的第一次体验：

1. 启动 MailClaw。
2. 登录一个你已经在用的邮箱。
3. 用另一个邮箱给它发一封测试邮件。
4. 打开 `Mail` 标签页。
5. 查看这条会话的内部协作和外发状态。

如果你想先看一个安全的本地演示：

```bash
pnpm demo:mail
```

然后打开 `http://127.0.0.1:3020/workbench/mail`。

## 在 Mail 标签页里能看到什么

- `Accounts`：哪些邮箱已经接入、当前是否正常
- `Rooms`：每条外部会话形成的持久房间
- `Mailboxes`：每个公开角色或内部角色实际看到的协作视角
- `Approvals`：等待人工或治理规则放行的外发邮件
- `Mail`：把这些对象放在一起的主入口

MailClaw 最大的区别不是“也能多智能体”，而是“多智能体过程看得见”。你不用盲信“系统已经帮你处理好了”，而是能直接看到主智能体、工作智能体、审阅者和守卫之间到底发生了什么。

## 多智能体，但不再混乱

MailClaw 明确拆开三件事：

- 外部会话
- 内部协作
- 每一轮之后真正留下来的持久记忆

这样多个智能体就能围绕同一封邮件协作，而不会把整条会话拖成一片不可读的长上下文泥潭。

## 内置团队模板

MailClaw 已经内置了可一键接入的常驻智能体模板，包括：

- `One-Person Company`
- `Three Provinces, Six Departments`

模板实现代码就在仓库里：

- <https://github.com/dangoZhang/mailclaw/blob/main/src/agents/templates.ts>

当前的 `One-Person Company` 模板参考了这个在 GitHub 上很流行的一人公司项目：

- <https://github.com/cyfyifanchen/one-person-company>

`Three Provinces, Six Departments` 模板则是 MailClaw 自带的一等编组模板，用来表达更强的审阅、治理和分工结构。

## 文档

- 文档站：<https://dangozhang.github.io/mailclaw/>
- 快速开始：<https://dangozhang.github.io/mailclaw/zh-CN/getting-started>
- 核心概念：<https://dangozhang.github.io/mailclaw/zh-CN/concepts>
- 多智能体协作：<https://dangozhang.github.io/mailclaw/zh-CN/multi-agent-workflows>
- 邮件工作台：<https://dangozhang.github.io/mailclaw/zh-CN/operator-console>
- Prompt 体积基准：<https://dangozhang.github.io/mailclaw/zh-CN/prompt-footprint>

## 许可

MIT。见 [LICENSE](./LICENSE)。
