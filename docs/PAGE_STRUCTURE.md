# 博尔赫斯中文站 · 页面结构

## 整体布局

```
┌─────────────────────────────────────────┐
│  AppHeader（顶栏：Logo、导航、主题切换）   │
├─────────────────────────────────────────┤
│                                         │
│  main（RouterView，根据路由渲染不同视图）  │
│                                         │
├─────────────────────────────────────────┤
│  AppFooter（页脚）                       │
└─────────────────────────────────────────┘
```

- **顶栏**：`AppHeader.vue`，分类来自 `content/_site.md` 的 `categories`；有二级时显示下拉，无二级时点击跳转到 `navLink(cat)`（优先用 `_site.md` 的 `links[分类名]`，否则 `/articles/:slug`）。
- **主内容**：由 `src/router/index.js` 的路由决定使用哪个 View。
- **页脚**：`AppFooter.vue`。

---

## 路由与页面一览

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | Home | HomeView | 首页，固定诗句「我用什么才能留住你」 |
| `/poem` | Poem | PoemView | 诗歌入口：标题「诗歌」+ 诗集列表（来自 `poem/_index.yml`） |
| `/poem/:collectionId` | PoemCollection | PoemView | 某诗集目录：返回图标 + 诗集名 + 篇目列表，返回→`/poem` |
| `/fiction` | Fiction | FictionView | 小说入口：标题「小说」+ 小说集列表（来自 `fiction/_index.yml`） |
| `/fiction/:collectionId` | FictionCollection | FictionView | 某小说集目录：返回图标 + 小说集名 + 篇目列表，返回→`/fiction` |
| `/articles` | Articles | ArticlesView | 文章总览：标题「文章」+ 全站文章列表 |
| `/articles/:category` | ArticlesByCategory | ArticlesView | 分类列表：标题为分类名（如「小说」「诗歌」「散文」）+ 该分类下文章或二级目录 |
| `/article/:slug` | Article | ArticleView | 单篇文章：任意一篇 md 的正文，底部有「返回」「下一篇」导航（部分文章不显示） |

---

## 内容与视图对应关系

- **诗歌**  
  - 配置：`content/poem/_index.yml`（title、collections）。  
  - 入口：`/poem` → 列出「深沉的玫瑰」「另一个，同一个」等。  
  - 目录：`/poem/La_rosa_profunda` 等 → 列出该诗集下篇目（来自 `getPoemCollectionList`，排除 index）。  
  - 单篇：`/article/poem/La_rosa_profunda/30-序言` 等，返回→诗集目录或 `/poem`（index 篇返回 `/poem`）。

- **小说**  
  - 配置：`content/fiction/_index.yml`（title、collections）。  
  - 入口：`/fiction` → 列出「阿莱夫」「小径分叉的花园」等。  
  - 目录：`/fiction/aleph`、`/fiction/the_garden_of_forking_paths` 等 → 列出该小说集下篇目（来自 `getFictionCollectionList`，标题用 frontmatter，排除 index）。  
  - 单篇：`/article/fiction/the_garden_of_forking_paths/01-chapter001` 等，返回→小说集目录；index 篇（如 `fiction/xxx/index`）返回→`/articles/fiction`。

- **散文 / 其他分类**  
  - 通过「文章」或顶栏分类进入 `/articles` 或 `/articles/:category`（如 `/articles/essays`）。  
  - 有 `subcategory: true` 的 md 会作为二级目录在顶栏下拉和列表里展示；单篇仍为 `/article/:slug`。

---

## 层级关系简图

```
首页 /
├── 诗歌 /poem
│   ├── 深沉的玫瑰 /poem/La_rosa_profunda
│   │   └── 单篇 /article/poem/La_rosa_profunda/xxx
│   └── 另一个，同一个 /poem/the_self_and_the_other
│       └── 单篇 /article/poem/the_self_and_the_other/xxx
│
├── 小说 /fiction
│   ├── 阿莱夫 /fiction/aleph
│   │   └── 单篇 /article/fiction/aleph/xxx
│   └── 小径分叉的花园 /fiction/the_garden_of_forking_paths
│       └── 单篇 /article/fiction/the_garden_of_forking_paths/xxx
│
└── 文章 /articles
    ├── 全部 /articles
    ├── 按分类 /articles/fiction、/articles/poetry、/articles/essays 等
    └── 单篇（任意） /article/:slug
```

顶栏「诗歌」「小说」等是否直接链到 `/poem`、`/fiction`，由 `content/_site.md` 的 `links` 是否配置决定；未配置时默认链到 `/articles/:slug`（如 `/articles/poetry`、`/articles/fiction`）。
