<!--
  文章分类列表页：/articles 或 /articles/:category
  从顶栏点击「小说」「散文」等进入时展示该分类下的文章或二级目录列表
-->
<template>
  <div class="articles">
    <h1>{{ pageTitle }}</h1>
    <!-- 有文章时：标题 + 日期（若有）+ 摘要（若有） -->
    <ul v-if="filtered.length" class="article-list">
      <li v-for="a in filtered" :key="a.slug">
        <RouterLink :to="`/article/${encodeURIComponent(a.slug)}`">{{ a.title }}</RouterLink>
        <span v-if="a.date" class="date">{{ formatDate(a.date) }}</span>
        <p v-if="a.summary" class="summary">{{ a.summary }}</p>
      </li>
    </ul>
    <!-- 无文章时的提示：按是否在分类页显示不同文案 -->
    <p v-else class="empty">
      <template v-if="currentCategory">该分类下暂无文章。</template>
      <template v-else>暂无文章。请将 .md 文件放入 <code>src/content/</code> 目录，并在 frontmatter 中设置 <code>category</code>。</template>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleList, CATEGORY_SLUG_TO_NAME } from '@/articles'

const route = useRoute()
/** 全站文章列表（含 frontmatter 解析结果），在 onMounted 时拉取 */
const articles = ref([])

/** 当前路由中的分类英文 slug，如 /articles/essays → "essays"，/articles 无 param 则为空 */
const currentCategorySlug = computed(() => {
  const c = route.params.category
  return c ? decodeURIComponent(c) : ''
})

/** 分类中文名（用于页面标题与筛选），由 slug 查表得到 */
const currentCategory = computed(() => {
  if (!currentCategorySlug.value) return ''
  return CATEGORY_SLUG_TO_NAME[currentCategorySlug.value] ?? currentCategorySlug.value
})

/** 页面大标题：有分类时用分类名，无分类时用「文章」 */
const pageTitle = computed(() => (currentCategory.value ? currentCategory.value : '文章'))

/**
 * 当前页要展示的文章列表：
 * - 无分类：展示全部文章
 * - 有分类：先筛出该 category，若其中有 subcategory 的（二级目录），则只展示这些二级项，否则展示该分类下全部
 */
const filtered = computed(() => {
  if (!currentCategory.value) return articles.value
  const inCategory = articles.value.filter((a) => a.category === currentCategory.value)
  const withSub = inCategory.filter((a) => a.subcategory)
  if (withSub.length > 0) return withSub
  return inCategory
})

/** 日期格式化：用于列表项旁的日期显示 */
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date.getTime()) ? d : date.toLocaleDateString('zh-CN')
}

async function load() {
  articles.value = await getArticleList()
}

onMounted(load)
</script>

<style scoped>
/* 页面标题 */
.articles h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1.25rem;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-list li {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.article-list li:last-child {
  border-bottom: none;
}

.article-list a {
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
}

.article-list a:hover {
  color: var(--color-accent);
}

/* 列表项右侧日期 */
.article-list .date {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

/* 列表项下方摘要 */
.article-list .summary {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  margin: 0.35rem 0 0;
  line-height: 1.6;
}

/* 无文章时的提示文案 */
.empty {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.empty code {
  background: var(--color-border);
  padding: 0.15em 0.4em;
  border-radius: 2px;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .articles h1 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .article-list li {
    padding: 0.85rem 0;
  }

  .article-list a {
    font-size: 0.9375rem;
  }

  .article-list .date {
    display: block;
    margin-left: 0;
    margin-top: 0.25rem;
  }
}
</style>
