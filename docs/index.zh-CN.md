---
layout: home

hero:
  name: MailClaw
  text: 让邮件工作真正有形状
  tagline: MailClaw 把外部邮件沉淀为持久房间，把内部多智能体协作显式呈现为虚拟邮件，把长期记忆压缩成预摘要，而不是让上下文越滚越长。
  actions:
    - theme: brand
      text: 3 分钟开始
      link: /zh-CN/getting-started#three-minute-first-mail
    - theme: alt
      text: 核心概念
      link: /zh-CN/concepts
    - theme: alt
      text: 邮件工作台
      link: /zh-CN/operator-console

features:
  - title: 房间就是会话真相
    details: 每个真实邮件会话都会落到一个持久房间里，带版本、时间线、审批和投递状态。
  - title: 内部协作也是邮件
    details: 智能体不共享一锅上下文，而是通过虚拟邮箱、协作线程和汇总器协作。
  - title: 预摘要优先，记忆更干净
    details: MailClaw 长期保留的是摘要、事实、决策、承诺这类预摘要，而不是原始推理轨迹。
  - title: 外发默认受治理
    details: 真正的外发必须经过草稿、审阅、审批和发件箱意图，工作智能体不能直接越权发送。
  - title: 一个 Mail 标签看全链路
    details: 账号、房间、协作邮箱、审批都在同一个 OpenClaw 风格 Mail 标签里可见。
---

## 为什么是 MailClaw

很多智能体系统只是把邮件当传输层。MailClaw 不是。

MailClaw 直接把邮件工作本身建模成运行时：

- 外部邮件进入房间
- 内部协作进入虚拟邮件
- 长期记忆保留为预摘要
- 外发副作用进入审批和发件箱

所以它既适合真实邮件用户，也适合需要追踪多智能体协作过程的团队。

## 核心工作流

1. 连接一个你已经在用的邮箱
2. 新邮件进入后创建或续接房间
3. 智能体在内部协作邮箱和协作线程里分工
4. 结果被压缩成预摘要
5. 你从 Mail 标签里查看账号、房间、协作邮箱和审批

## 四个核心特性

### 房间（Room）

房间是外部邮件会话的持久真相边界。

- 连续性由回复结构和邮件服务线索共同决定
- 房间承载版本、参与者、附件证据、审批和回放
- 新回复到达时，旧的过期工作会失效而不是静默混入

### 虚拟邮件（Virtual Mail）

内部多智能体协作通过虚拟邮件完成。

- 每个智能体都可以有公开邮箱和内部角色邮箱
- 内部回复遵循单父回复
- 汇总由汇总器负责
- 外部线程保持干净，内部协作仍可回看

### 预摘要（Pre）

MailClaw 使用预摘要优先的记忆方式，而不是把整段上下文一路往后拖。

- 临时推理发生在临时工作区里
- 持久结果压缩成预摘要
- 后续轮次默认只加载最新来信、最新预摘要和必要引用

### 受治理外发（Governed Delivery）

真实外发不是工作智能体直接做，而是通过治理链路：

- 草稿
- 审阅 / 守卫检查
- 审批
- 发件箱意图
- 投递尝试

## 从这里开始

- [快速开始](./getting-started.zh-CN.md)
- [核心概念](./concepts.zh-CN.md)
- [多智能体协作](./multi-agent-workflows.zh-CN.md)
- [邮件工作台](./operator-console.zh-CN.md)
- [集成](./integrations.zh-CN.md)

## 对 OpenClaw 用户

推荐路径保持不变：

- 先启动 MailClaw 运行时，或者直接运行 `mailclaw gateway`
- 再运行 `mailclaw dashboard`
- 登录 OpenClaw/Gateway
- 点击 `Mail`

`mailclaw open` 才是直达兜底入口，不是主要叙事。
