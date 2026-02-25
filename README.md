# 博尔赫斯中文站

Vue 3 + Vite 前端，文章内容为 Markdown 文件，可自行上传到 `content/` 目录。

## 开发

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 构建

```bash
npm run build
npm run preview   # 预览构建结果
```

## 如何添加文章

1. 在 **`src/content/`** 目录下新建任意 `.md` 文件，例如 `src/content/小径分岔的花园.md`。
2. 在文件开头写 **YAML frontmatter**（用 `---` 包裹，推荐），其中 **category** 须为下列之一，否则不会出现在分类页：

```yaml
---
title: 小径分岔的花园
date: 2025-02-24
category: 短篇小说
summary: 一段简短摘要，会显示在首页和文章列表。
---
```

**分类可选值**：`生平事迹`、`诗歌`、`小说`、`散文`、`关于本站`。

**二级分类（可选）**：若希望某篇文章作为该分类下的「子项」出现在顶栏下拉和分类列表页，在 frontmatter 中增加 `subcategory: true`。例如《阿莱夫》目录页：

```yaml
category: 短篇小说
subcategory: true
```

**归属某一目录页（可选）**：若文章从某个「目录页」点进去（如《阿莱夫》下的《永生》），希望「返回上一级」回到该目录页而不是一级分类，在 frontmatter 中增加 `parentSlug: 目录页的 slug`。例如《永生》：

```yaml
category: 短篇小说
parentSlug: aleph/阿莱夫目录
```

3. 下面正常写 Markdown 正文即可。
4. 保存后刷新页面，文章会出现在首页「近期文章」、对应分类页及「全部」列表中。

文章 URL 由文件名决定：`src/content/随笔/某篇.md` 对应路径 `/article/随笔/某篇`。

## 技术栈

- **Vue 3** + **Vite**
- **Vue Router** 前端路由
- **gray-matter** 解析 frontmatter
- **marked** 渲染 Markdown
