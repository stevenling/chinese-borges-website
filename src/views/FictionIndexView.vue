<!--
  小说入口页：/fiction
  展示小说集列表，配置来自 content/fiction/_index.yml。
-->
<template>
  <div class="fiction-index-view">
    <h1>{{ fictionConfig.title }}</h1>
    <ul class="collection-list">
      <li v-for="c in fictionConfig.collections" :key="c.id">
        <RouterLink :to="`/fiction/${encodeURIComponent(c.id)}`">{{ c.title || c.id }}</RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFictionConfig } from '@/articles'

/** 小说入口配置（来自 content/fiction/_index.yml）：标题与小说集列表 */
const fictionConfig = ref({ title: '小说', collections: [] })

onMounted(async () => {
  fictionConfig.value = await getFictionConfig()
})
</script>

<style scoped>
.fiction-index-view {
  padding-bottom: 2.5rem;
}

.fiction-index-view h1 {
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
  .fiction-index-view h1 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .collection-list a {
    font-size: 0.9375rem;
  }
}
</style>
