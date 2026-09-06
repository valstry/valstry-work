# Valstry · 知识库

个人学习笔记 + 外部工具合集（中文）。在线：https://valstry.work

不是博客时间线首页，而是类似 Obsidian 的力导向关系图谱：笔记与工具是两类节点，边来自 frontmatter 的 related 字段。

技术栈：Astro（静态输出）+ TypeScript + Markdown Content Collections。构建产物适合 Cloudflare Pages（dist/）。

## 本地开发

bun install && bun run dev

浏览器打开终端提示的地址（默认 http://localhost:4321）。

## 构建与预览

bun run build && bun run preview

## 内容与图谱数据

- 笔记: src/content/posts/*.md （站内 wiki；可选 related）
- 工具: src/content/tools/*.md （title / url / description / tags / related）

related 写法: note:slug 或 tool:id；也可写裸 slug（笔记优先）。

构建时 src/lib/graph.ts 生成节点与边；src/scripts/force-graph.ts 渲染力导向图。点击笔记站内跳转，点击工具新标签打开外链。

页面: / 图谱；/posts/ 笔记列表；/tools/ 工具列表；/about/ 关于。

## 部署到 Cloudflare Pages

Build command: bun run build；Output: dist；分支 main；域名 valstry.work。

## 许可

保留所有权利；转载请注明出处。
