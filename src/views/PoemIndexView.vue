<!--
  诗歌入口页：/poem
  展示诗集列表，配置来自 content/poem/_index.yml。
-->
<template>
  <div class="poem-index-view">
    <h1>{{ poetryConfig.title }}</h1>
    <ul class="collection-list">
      <li v-for="c in poetryConfig.collections" :key="c.id">
        <RouterLink :to="`/poem/${encodeURIComponent(c.id)}`">{{ c.title || c.id }}</RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPoetryConfig } from '@/articles'

/** 诗歌入口配置（来自 content/poem/_index.yml）：标题与诗集列表 */
const poetryConfig = ref({ title: '诗歌', collections: [] })

onMounted(async () => {
  poetryConfig.value = await getPoetryConfig()
})
</script>

<style scoped>
.poem-index-view {
  padding-bottom: 2.5rem;
}

.poem-index-view h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1.25rem;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

.collection-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.collection-list li {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.collection-list li:last-child {
  border-bottom: none;
}

.collection-list a {
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
}

.collection-list a:hover {
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .poem-index-view h1 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .collection-list a {
    font-size: 0.9375rem;
  }
}
</style>
