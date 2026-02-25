<!--
  单篇文章正文页：路由 /article/:slug
  根据 URL 中的 slug 加载对应 Markdown 文章并渲染；提供「返回」与「下一篇」导航。
-->
<template>
  <div class="article-page">
    <!-- 有文章数据：标题、日期、正文 + 底部导航 -->
    <template v-if="article">
      <article class="article">
        <header class="article-header">
          <h1>{{ article.title }}</h1>
          <p v-if="article.date" class="date">{{ formatDate(article.date) }}</p>
        </header>
        <div class="article-body prose" v-html="article.content"></div>
      </article>
      <!-- 仅部分文章显示「返回 / 下一篇」（生平事迹、关于本站等单页不显示） -->
      <nav v-if="showArticleNav" class="article-nav">
        <RouterLink :to="backLink" class="nav-link">← 返回</RouterLink>
        <RouterLink v-if="nextSlug" :to="`/article/${encodeURIComponent(nextSlug)}`" class="nav-link">→ {{ nextTitle }}</RouterLink>
      </nav>
    </template>
    <div v-else-if="loading" class="loading">加载中…</div>
    <div v-else class="not-found">
      <h2>未找到该文章</h2>
      <RouterLink to="/">返回首页</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleBySlug, getArticleList, getPoemCollectionList, getSiteConfig, getCategorySlug, getOrderedSlugsFromIndex } from '@/articles'

const route = useRoute()
/** 当前文章数据（title、content、category、slug、parentSlug 等），由 getArticleBySlug 拉取 */
const article = ref(null)
/** 是否处于加载中，用于显示「加载中…」 */
const loading = ref(true)
/** 全站文章列表（含 parentSlug），用于计算「下一篇」 */
const articleList = ref([])
/** 当前文章所属二级分类的 index.md 解析出的顺序（slug 数组），有则「下一篇」严格按此顺序 */
const orderedSiblingSlugs = ref([])
/** 站点配置（来自 content/_site.md），用于 links 覆盖与 backLink 判断 */
const siteConfig = ref({ links: {} })

/**
 * 同系列下一篇的 slug：
 * - 若已从 index.md 解析出顺序（orderedSiblingSlugs）则严格按该顺序取下一篇；
 * - 否则有 parentSlug 时按同 parentSlug 内 slug 排序，无则按同分类日期序。
 */
const nextSlug = computed(() => {
  if (!article.value || !showArticleNav.value) return ''
  const current = article.value.slug
  const ordered = orderedSiblingSlugs.value
  if (ordered.length) {
    const idx = ordered.indexOf(current)
    if (idx >= 0 && idx < ordered.length - 1) return ordered[idx + 1]
    return ''
  }
  const list = articleList.value
  const parent = article.value.parentSlug
  const cat = article.value.category
  let sameGroup
  if (parent) {
    sameGroup = list.filter((a) => a.parentSlug === parent).sort((a, b) => a.slug.localeCompare(b.slug))
  } else {
    sameGroup = list.filter((a) => a.category === cat && !a.parentSlug)
  }
  const idx = sameGroup.findIndex((a) => a.slug === current)
  const next = idx >= 0 && idx < sameGroup.length - 1 ? sameGroup[idx + 1] : null
  return next ? next.slug : ''
})

/** 下一篇的标题（用于导航文案「→ 标题」），从 articleList 中按 nextSlug 查找 */
const nextTitle = computed(() => {
  if (!nextSlug.value) return ''
  const a = articleList.value.find((x) => x.slug === nextSlug.value)
  return a ? a.title : nextSlug.value
})

/**
 * 是否显示底部导航（返回 / 下一篇）
 * 生平事迹、关于本站等单页不显示，其余分类内文章显示
 */
const showArticleNav = computed(() => {
  if (!article.value) return false
  const cat = article.value.category
  const slug = article.value.slug || ''
  if (cat === '生平事迹' || cat === '关于本站') return false
  if (slug === '生平事迹' || slug === '关于本站') return false
  return true
})

/**
 * 「返回」链接目标，按优先级：
 * 1. 当前文章在二级目录下（slug 含多级路径，如 essays/history_of_eternity/序言）→ 返回该目录的 index 页（目录页）
 * 2. 有 parentSlug 且不满足 1 → 返回父级文章页 /article/:parentSlug
 * 3. 诗歌子页（slug 形如 poem/xxx）→ 返回诗集页 /poem/:collection
 * 4. 该分类在 _site links 里配置为 /article/xxx → 返回首页 /
 * 5. 否则 → 返回分类列表 /articles/:slug（英文 slug）
 */
const backLink = computed(() => {
  if (!article.value) return '/'
  const slug = article.value.slug || ''
  const parts = slug.split('/')
  if (slug.startsWith('poem/') && parts.length >= 2) return `/poem/${encodeURIComponent(parts[1])}`
  if (parts.length >= 2) {
    const sectionIndexSlug = parts.slice(0, -1).join('/') + '/index'
    return `/article/${encodeURIComponent(sectionIndexSlug)}`
  }
  if (article.value.parentSlug) return `/article/${encodeURIComponent(article.value.parentSlug)}`
  const cat = article.value.category
  const link = siteConfig.value.links[cat]
  if (link && link.startsWith('/article/')) return '/'
  return `/articles/${getCategorySlug(cat)}`
})

/** 日期格式化为中文本地日期（如 2025年1月1日） */
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date.getTime()) ? d : date.toLocaleDateString('zh-CN')
}

/** 根据当前路由 params.slug 拉取文章并写入 article，用于首屏与路由变化时 */
async function load() {
  loading.value = true
  article.value = await getArticleBySlug(route.params.slug)
  orderedSiblingSlugs.value = []
  if (article.value && article.value.slug) {
    const parts = article.value.slug.split('/')
    if (parts.length >= 2) {
      const indexSlug = parts.slice(0, -1).join('/') + '/index'
      orderedSiblingSlugs.value = await getOrderedSlugsFromIndex(indexSlug)
    }
  }
  /* 散文、诗歌等凡有 index.md 的目录均按该文件链接顺序决定「下一篇」 */
  loading.value = false
  await nextTick()
  requestAnimationFrame(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })
}

onMounted(async () => {
  const [config, list] = await Promise.all([getSiteConfig(), getArticleList()])
  siteConfig.value = config
  articleList.value = list
  await load()
})
/** 同一页面内 slug 变化（如从一篇文章点进另一篇）时重新拉取 */
watch(() => route.params.slug, load)
</script>

<style scoped>
/* ---------- 页面与文章结构 ---------- */
.article-page {
  padding-bottom: 2.5rem;
}

.article-header {
  margin-bottom: 1.75rem;
}

.article-header h1 {
  font-size: 1.625rem;
  font-weight: 500;
  margin: 0 0 0.35rem;
  letter-spacing: 0.03em;
  line-height: 1.35;
  color: var(--color-text);
}

.article-header .date {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  margin: 0;
}

.article-body {
  line-height: 1.85;
  color: var(--color-text);
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* ---------- 底部导航（返回 / 下一篇） ---------- */
.article-nav {
  margin-top: 2.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.article-nav .nav-link {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.9375rem;
  letter-spacing: 0.02em;
}

.article-nav .nav-link:hover {
  text-decoration: underline;
}

/* ---------- 加载中与 404 ---------- */
.loading,
.not-found {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.not-found a {
  color: var(--color-accent);
}

/* ---------- 正文 Markdown 样式（.prose 由 v-html 渲染，用 :deep 穿透） ---------- */
.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1.75em 0 0.5em;
  letter-spacing: 0.02em;
  color: var(--color-text);
}

.prose :deep(h3) {
  font-size: 1.0625rem;
  font-weight: 500;
  margin: 1.5em 0 0.4em;
  color: var(--color-text);
}

.prose :deep(p) {
  margin: 0.85em 0;
}

/* 目录式列表：整段仅一个链接时视为目录项，横线分隔 */
.prose :deep(p:has(> a:only-child)) {
  margin: 0;
  padding: 0.65em 0;
  border-bottom: 1px solid var(--color-border);
}

.prose :deep(p:has(> a:only-child):last-child) {
  border-bottom: none;
}

.prose :deep(p:has(> a:only-child) a) {
  font-size: 1rem;
  font-weight: 400;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 0.85em 0;
  padding-left: 1.5em;
}

/* 引用块 */
.prose :deep(blockquote) {
  margin: 1.25em 0;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
  color: var(--color-text-muted);
  font-style: normal;
}

/* 行内代码 */
.prose :deep(code) {
  background: var(--color-border);
  padding: 0.15em 0.4em;
  border-radius: 2px;
  font-size: 0.9em;
  color: var(--color-text);
}

/* 代码块 */
.prose :deep(pre) {
  background: #2d2a26;
  color: #e8e6e1;
  padding: 1rem 1.25rem;
  border-radius: 2px;
  overflow-x: auto;
  margin: 1.25em 0;
  font-size: 0.9rem;
}

.prose :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

/* 正文内链接 */
.prose :deep(a) {
  color: var(--color-accent);
  text-decoration: none;
}

.prose :deep(a:hover) {
  text-decoration: underline;
}

/* 移动端 */
@media (max-width: 768px) {
  .article-page {
    padding-bottom: 2rem;
  }

  .article-header h1 {
    font-size: 1.375rem;
  }

  .article-nav {
    margin-top: 1.75rem;
    padding-top: 1rem;
    gap: 0.75rem;
  }

  .article-nav .nav-link {
    font-size: 0.875rem;
  }

  .prose :deep(h2) {
    font-size: 1.125rem;
  }

  .prose :deep(h3) {
    font-size: 1rem;
  }

  .prose :deep(p) {
    margin: 0.75em 0;
  }

  .prose :deep(pre) {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    margin: 1em 0;
  }
}
</style>
