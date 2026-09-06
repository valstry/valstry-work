---
title: 如何用 Cloudflare Pages 部署静态站（入门）
description: 从仓库连接到自定义域名，把 Astro / 纯静态站点稳定发布到 Cloudflare Pages。
pubDate: 2026-09-01
tags:
  - Cloudflare
  - 部署
  - 入门
related:
  - tool:cloudflare-docs
  - tool:github
  - note:cursor-ai-tutorial-workflow
---

把静态站放到 Cloudflare Pages，流程其实很短：仓库连上、填对构建命令、绑定域名。下面按「第一次做也能跑通」来写。

## 适合什么站点

Pages 适合纯静态产物：HTML/CSS/JS，或 Astro、Hugo、Vite 等构建后输出到某个目录（常见是 dist/）的站点。不需要你自己管服务器进程；构建在云端完成，全球 CDN 分发。

## 准备

1. GitHub（或 GitLab / Bitbucket）上有一个公开或已授权的仓库。
2. 本地能成功执行构建，例如：`npm install && npm run build`，并确认输出目录是 `dist/`。
3. 一个 Cloudflare 账号；域名可先用 `*.pages.dev`，再绑自定义域名。

## 连接仓库并创建项目

登录 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。选中仓库后填写：

- **Framework preset**：若有 Astro 可直接选；没有就选 None。
- **Build command**：`npm run build`
- **Build output directory**：`dist`
- **Root directory**：仓库根目录（若 monorepo 再改子目录）

环境变量一般 v1 不需要。保存后触发首次部署，等绿色成功即可打开 `xxx.pages.dev`。

## 常见踩坑

- **输出目录写错**：构建成功但 404，多半是 `dist` 写成了 `build` 或 `public`。以本地构建结果为准。
- **Node 版本**：依赖较新时，在 Pages 项目设置里指定兼容的 Node 版本（例如 20）。
- **路径与尾斜杠**：Astro 默认静态路径带尾斜杠时，站内链接保持一致，避免混合写法。

## 绑定 valstry.work 这类自定义域名

在 Pages 项目 → **Custom domains** → 添加 `valstry.work` 与 `www`（按你需要）。Cloudflare 托管 DNS 时，按提示添加 CNAME/记录即可；若域名在别处解析，按面板给出的记录改 NS 或 CNAME。

HTTPS 证书一般会自动签发。改完 DNS 后等几分钟到几小时生效，用无痕窗口验证。

## 发布节奏建议

- `main` 分支自动生产部署；需要预览可用 PR 预览环境。
- README 写清构建命令与输出目录，避免同事或未来的自己改错配置。
- 先保证本地 `npm run build` 稳定，再推远程——Pages 日志读起来费劲，本地先失败更省时间。

做完以上步骤，你就有一条「推送 → 构建 → 全球可访问」的静态站流水线。后续加文章只改内容仓库即可，不必再碰服务器。
