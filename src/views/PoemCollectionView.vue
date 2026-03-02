<!--
  诗集目录页：/poem/:collectionId
  展示该诗集下的篇目列表，篇目标题来自文件名（去数字前缀）。
-->
<template>
  <div class="poem-collection-view">
    <p class="back-link">
      <RouterLink to="/poem" class="back-icon" aria-label="返回">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </RouterLink>
    </p>
    <h1>{{ collectionTitle }}</h1>
    <ul v-if="poems.length" class="poem-list">
      <li v-for="p in poems" :key="p.slug">
        <RouterLink :to="poemArticleTo(p.slug)">{{ p.title }}</RouterLink>
      </li>
    </ul>
    <p v-else class="empty">该诗集下暂无篇目。</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPoemCollectionList, getPoetryConfig } from '@/articles'

const route = useRoute()
/** 诗歌入口配置（用于根据 collectionId 解析诗集标题） */
const poetryConfig = ref({ title: '诗歌', collections: [] })

/** 当前路由中的诗集 id */
const collectionId = computed(() => route.params.collectionId || '')

/** 当前诗集的展示标题（从 poetryConfig.collections 按 id 查找） */
const collectionTitle = computed(() => {
  const c = poetryConfig.value.collections.find((x) => x.id === collectionId.value)
  return (c && c.title) || collectionId.value
})

/** 当前诗集下的篇目列表（slug + title，已排除 index） */
const poems = ref([])

function load() {
  if (!collectionId.value) {
    poems.value = []
    return
  }
  poems.value = getPoemCollectionList(collectionId.value)
}

/** 诗集内文章链接：/poem/:collectionId/:articleSlug，与当前页路由一致 */
function poemArticleTo(fullSlug) {
  const cid = collectionId.value
  const rest = fullSlug.startsWith(`poem/${cid}/`) ? fullSlug.split('/').slice(2).join('/') : fullSlug
  return `/poem/${encodeURIComponent(cid)}/${encodeURIComponent(rest)}`
}

onMounted(async () => {
  poetryConfig.value = await getPoetryConfig()
})
load()
watch(() => collectionId.value, load)
</script>

<style scoped>
.poem-collection-view {
  padding-bottom: 2.5rem;
}

.back-link {
  margin: 0 0 0.75rem;
}

.back-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  text-decoration: none;
}

.back-icon:hover {
  color: var(--color-accent);
}

.poem-collection-view h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1.25rem;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

.poem-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.poem-list li {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.poem-list li:last-child {
  border-bottom: none;
}

.poem-list a {
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
}

.poem-list a:hover {
  color: var(--color-accent);
}

.empty {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .poem-collection-view h1 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .poem-list a {
    font-size: 0.9375rem;
  }
}
</style>
