<template>
  <div class="poem-view">
    <template v-if="!collectionId">
      <h1>{{ poetryConfig.title }}</h1>
      <ul class="collection-list">
        <li v-for="c in poetryConfig.collections" :key="c.id">
          <RouterLink :to="`/poem/${encodeURIComponent(c.id)}`">{{ c.title || c.id }}</RouterLink>
        </li>
      </ul>
    </template>
    <template v-else>
      <p class="back-link">
        <RouterLink to="/poem" class="back-icon" aria-label="返回">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </RouterLink>
      </p>
      <h1>{{ collectionTitle }}</h1>
      <ul v-if="poems.length" class="poem-list">
        <li v-for="p in poems" :key="p.slug">
          <RouterLink :to="`/article/${encodeURIComponent(p.slug)}`">{{ p.title }}</RouterLink>
        </li>
      </ul>
      <p v-else class="empty">该诗集下暂无篇目。</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPoemCollectionList, getPoetryConfig } from '@/articles'

const route = useRoute()
const poetryConfig = ref({ title: '诗歌', collections: [] })

const collectionId = computed(() => route.params.collectionId || '')

const collectionTitle = computed(() => {
  const c = poetryConfig.value.collections.find((x) => x.id === collectionId.value)
  return (c && c.title) || collectionId.value
})

const poems = ref([])

function load() {
  if (!collectionId.value) {
    poems.value = []
    return
  }
  poems.value = getPoemCollectionList(collectionId.value)
}

onMounted(async () => {
  poetryConfig.value = await getPoetryConfig()
})
load()
watch(() => collectionId.value, load)
</script>

<style scoped>
.poem-view {
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

/* 页面标题（诗歌 / 诗集名） */
.poem-view h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1.25rem;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

/* 诗集列表、篇目列表：无符号列表 */
.collection-list,
.poem-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.collection-list li,
.poem-list li {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.collection-list li:last-child,
.poem-list li:last-child {
  border-bottom: none;
}

/* 链接样式 */
.collection-list a,
.poem-list a {
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
}

.collection-list a:hover,
.poem-list a:hover {
  color: var(--color-accent);
}

/* 空状态提示 */
.empty {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

/* 窄屏适配 */
@media (max-width: 768px) {
  .poem-view h1 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .collection-list a,
  .poem-list a {
    font-size: 0.9375rem;
  }
}
</style>
