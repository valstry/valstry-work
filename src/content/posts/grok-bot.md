---
title: Grok Bot
description: 个人知识库的第一个节点：Grok Bot 是什么、我拿它做什么、和 Cursor / GitHub / 域名怎么串起来。
pubDate: 2026-09-06
tags:
  - AI
  - Grok Bot
  - 工作流
related:
  - tool:grok-bot
  - tool:cursor
  - tool:github
  - tool:cloudflare-docs
  - note:cursor-ai-tutorial-workflow
  - note:cloudflare-pages-deploy
  - note:automation-tool-selection
---

这是本站图谱里的**第一个节点**。不是广告页，是给我自己用的说明书：Grok Bot 能干啥、边界在哪、和旁边那些工具怎么连。

## 它是什么

Grok Bot 跑在 Cursor 里，是一个能长期跟着你做事的助手：有自己的电脑（浏览器、终端），也能在你授权后碰你本机上的命令/文件；能记你定过的域名、仓库、偏好，下次不用从头解释。

对我来说，它更像「会动手的笔记本」：不只给建议，还能打开后台、改 DNS、起预览、推 GitHub。

## 我拿它做什么

当前这条线上，已经用它做过或正在做：

1. **域名与 DNS**：Namecheap / Cloudflare 核对、迁 nameserver、确认 `valstry.*` 状态。
2. **搭站**：`valstry.work` 用 Astro + Cloudflare Pages；仓库在 GitHub `valstry/valstry-work`。
3. **知识库形态**：不要纯博客列表，要 Obsidian 那种关系图——笔记 + 可跳转的工具。
4. **登录接力**：GitHub 设备码、Cloudflare 登录这类只能人点的步骤，它打开页面，我登完交还。

以后新工具、新笔记，也优先从「和 Grok Bot 怎么配合」写进图谱，而不是散落收藏夹。

## 和旁边节点的关系

- **Cursor**：编辑器本体；Grok Bot 坐在里面协作写代码、改站。
- **GitHub**：代码与 Pages 的源；登录、建仓、推 `main`。
- **Cloudflare 文档 / Pages 笔记**：域名与静态站发布。
- **自动化选型笔记**：什么时候让助手直接干，什么时候自己写脚本或上 SaaS。

## 使用备忘（给未来的自己）

- 说清楚目标就够，不必先替它选技术路线；它会边做边问真正卡人的点。
- 密码、2FA、支付只在你本机或它交给你的桌面上完成，不要往聊天里贴密钥。
- 前端丑可以先忍，内容与结构对了再丢给 Codex / Claude 抛光。
- 工具节点要「能点开就用」：外链指向真实入口，一句话说明什么时候点它。

下一篇可以写：怎么给本站加一个新工具节点（文件放哪、`related` 怎么填）。
