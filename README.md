# 神笔君 · Okeeper

张跃的个人技术博客。文章源稿位于 `content/posts/`，页面模板和样式位于 `site/`，构建结果写入 `dist/`。首页、分类、归档、搜索索引、Atom 订阅和站点地图都从同一批文章生成。

使用 AI 修改博客时，先读 [AGENTS.md](AGENTS.md)，了解本站的设计取向、作者署名、搜索与 AI 阅读约定，以及对应的验收方法。

## 修改或新建文章

在 `content/posts/` 下按标题找到对应的 Markdown 文件，修改正文并保存。若要新增文章，可按年份新建文件，例如 `content/posts/2026/一次性能排查.md`。

```markdown
---
title: "一次性能排查"
date: "2026-11-24T09:00:00+08:00"
url: "/notes/performance-investigation/"
categories: ["软件笔记"]
tags: ["性能优化", "Java"]
summary: "记录一次线上响应变慢的定位过程。"
---

## 发现问题

从日志里的第一条慢请求开始……
```

`title`、`date` 和 `url` 为必填字段。`url` 是文章的固定地址，改标题、重命名文件或移动年份目录时可以沿用它。日期支持 `YYYY-MM-DD` 和带时区的 ISO 8601 格式。系统按发表时间倒序排列文章，修改旧文时可用 `updated` 指定更新时间。

`categories`、`tags`、`summary`、`cover` 都可省略。首页按发表时间选择头条；设置 `cover: "/images/my-cover.webp"` 即可更换该篇的首页封面或列表缩略图。未配置封面的普通文章以文字展示，头条使用站点线框插图。缺少摘要时，构建器从正文提取。含公式的文章可在头部加入 `math: true`，正文使用 `$…$` 或 `$$…$$`。文章支持表格、代码块和 HTML。图片可以放在 `public/images/`，正文中用 `![说明](/images/图片名.png)` 引用。

## 本地预览

使用 Node.js 22 或更高版本，在仓库根目录运行：

```sh
npm ci
npm run dev
```

打开终端打印的地址，默认是 `http://127.0.0.1:4173/`。保存文章、模板、样式或图片后，预览会重新构建并刷新浏览器。若构建报错，终端会指出问题，上一次成功生成的页面仍可浏览。需要其他端口时可运行 `npm run dev -- --port 8080`。

要生成可部署的整个网站，运行 `npm run build`。`dist/` 可由普通静态服务器托管，包含每篇文章的完整 HTML。

## 更新线上博客

首次接入工作流时，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。把文章或主题改动合入 `master` 后，**Actions → Publish blog** 会安装锁定的依赖、生成站点并部署。也可从该工作流手动重新发布。自定义域名沿用 `CNAME` 中的 `okeeper.com`，同步核对 Pages 设置中的域名。[GitHub Pages 发布说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 搜索与 AI 阅读入口

作者身份、品牌名、简历及 GitHub 地址统一维护在 `site/identity.mjs`。首页标明博客和作者的关系，关于页作为作者的公开主页，文章署名和结构化数据均指向该页。关于页的代表文章由 `site/selected-writing.mjs` 选择，标题和链接随原稿生成。

每篇有正文的主版本都会生成带作者、日期和网页原文链接的 `index.md`。读者或 Agent 可从 [阅读指南](https://okeeper.com/llms.txt) 进入[完整 Markdown 目录](https://okeeper.com/articles.md)。发布重复文章时可在副本头部设置 `canonical`，填写站内主版本的固定路径。搜索引擎地图和 Markdown 目录只列主版本。实质修订正文后填写真实的 `updated`，`summary` 适合用一两句概括本篇讨论的问题和结论。

爬虫可从 [robots.txt](https://okeeper.com/robots.txt) 发现[站点地图](https://okeeper.com/sitemap.xml)。Google Search Console、Bing Webmaster Tools 可使用这个地图；百度另有[文章地图](https://okeeper.com/baidusitemap.xml)。在已验证的站长后台，可用网址检查或收录报告观察搜索表现，用 Bing 的 AI Performance 查看可用的引用数据。[Google 站点地图说明](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)

Pages 发布时比较前后两次规范网页的内容摘要，并在部署成功后通过 IndexNow 提交新增、变化和移除的网址。首次建立基线时会提交当前地图中的网址。`public/indexnow-key.txt` 是该协议要求公开托管的站点校验文件。通知结果在 **Publish blog → notify-search**，该步骤可单独重试。HTTP 200 或 202 表示服务已收到提交，实际收录及 AI 引用须另行观察。[IndexNow 协议](https://www.indexnow.org/documentation) · [Google AI 搜索说明](https://developers.google.com/search/docs/appearance/ai-features)

## 文件位置

| 要修改的内容 | 位置 |
| --- | --- |
| 文章、发布时间、分类、标签 | `content/posts/` |
| 页面结构与站点导航 | `site/*.mjs` |
| 样式、交互与界面图片 | `site/assets/` |
| 保留原网址的静态资源 | `public/` |
| 内容解析、路由与订阅生成 | `scripts/` |
| 发布到 GitHub Pages | `.github/workflows/pages.yml` |

本次迁移将原站 118 个已发布条目与作者的 Markdown 原稿逐篇匹配，保留了文章固定链接和分类、标签、年月归档及分页地址。此后在本仓库的 `content/posts/` 维护文章。历史文章的外部图床链接继续指向原地址。[迁移时的原稿版本](https://github.com/okeeper/hexo-matery-modified/tree/99eb5884a8fac72e68cd81bb6e0693044f5fdd75/source/_posts)
