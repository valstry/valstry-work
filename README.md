# Valstry Work

AI 与自动化工具教程站点（中文）。在线地址：[valstry.work](https://valstry.work)

技术栈：Astro（静态输出）+ TypeScript + Markdown Content Collections。

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 http://localhost:4321）。

## 构建

```bash
npm run build
```

静态产物输出到 `dist/`。本地预览：

```bash
npm run preview
```

## 部署到 Cloudflare Pages

1. 在 Cloudflare Dashboard 创建 Pages 项目，连接本 GitHub 仓库。
2. 构建配置：
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - Node.js 版本建议 20+
3. 生产分支使用 `main`。
4. 在项目 Custom domains 中绑定 `valstry.work`（以及可选的 `www`），按提示完成 DNS。

无需 Wrangler 也可完成静态部署；本仓库 v1 不包含 Workers 运行时配置。

## 内容结构

- 文章：`src/content/posts/*.md`
- 页面：`src/pages/`
- 布局与组件：`src/layouts/`、`src/components/`

新增文章：在 `src/content/posts/` 添加 Markdown，填写 frontmatter（title、description、pubDate、tags）即可。

## 许可

站点内容与代码默认保留所有权利；转载请注明出处。
