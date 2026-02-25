<!--
  小说视图：/fiction 与 /fiction/:collectionId
  入口页展示小说集列表（来自 fiction/_index.yml），子页展示该小说集下的篇目列表，篇目标题取自各 md 的 frontmatter。
-->
<template>
  <div class="fiction-view">
    <!-- 无 collectionId：小说入口页，展示「阿莱夫」「小径分叉的花园」等小说集链接 -->
    <template v-if="!collectionId">
      <h1>{{ fictionConfig.title }}</h1>
      <ul class="collection-list">
        <li v-for="c in fictionConfig.collections" :key="c.id">
          <RouterLink :to="`/fiction/${encodeURIComponent(c.id)}`">{{ c.title || c.id }}</RouterLink>
        </li>
      </ul>
    </template>
    <!-- 有 collectionId：某本小说集的目录页，顶部返回图标 + 标题 + 篇目列表 -->
    <template v-else>
      <header class="collection-header">
        <RouterLink to="/fiction" class="back-icon" aria-label="返回">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </RouterLink>
        <h1>{{ collectionTitle }}</h1>
      </header>
      <ul v-if="items.length" class="item-list">
        <li v-for="p in items" :key="p.slug">
          <RouterLink :to="`/article/${encodeURIComponent(p.slug)}`">{{ p.title }}</RouterLink>
        </li>
      </ul>
      <p v-else class="empty">该小说集下暂无篇目。</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFictionCollectionList, getFictionConfig } from '@/articles'

const route = useRoute()
/** 小说入口配置（来自 content/fiction/_index.yml）：标题与小说集列表 */
const fictionConfig = ref({ title: '小说', collections: [] })

/** 当前路由中的小说集 id，如 aleph、the_garden_of_forking_paths */
const collectionId = computed(() => route.params.collectionId || '')

/** 当前小说集的展示标题（从 fictionConfig.collections 按 id 查找） */
const collectionTitle = computed(() => {
  const c = fictionConfig.value.collections.find((x) => x.id === collectionId.value)
  return (c && c.title) || collectionId.value
})

/** 当前小说集下的篇目列表（slug + title，标题来自 frontmatter，已排除 index） */
const items = ref([])

/** 根据 collectionId 异步加载该小说集的篇目列表 */
async function load() {
  if (!collectionId.value) {
    items.value = []
    return
  }
  items.value = await getFictionCollectionList(collectionId.value)
}

onMounted(async () => {
  fictionConfig.value = await getFictionConfig()
})
load()
watch(() => collectionId.value, load)
</script>

<style scoped>
.fiction-view {
  padding-bottom: 2.5rem;
}

/* 小说集目录页：返回图标 + 标题，返回在上、标题在下 */
.collection-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.collection-header .back-icon {
  order: -1;
  margin-bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  text-decoration: none;
}

.collection-header .back-icon:hover {
  color: var(--color-accent);
}

.fiction-view .collection-header h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

/* 小说入口页的标题（无 collectionId 时） */
.fiction-view > h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1.25rem;
  letter-spacing: 0.03em;
  color: var(--color-text);
}

/* 小说集列表、篇目列表 */
.collection-list,
.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.collection-list li,
.item-list li {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.collection-list li:last-child,
.item-list li:last-child {
  border-bottom: none;
}

.collection-list a,
.item-list a {
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
}

.collection-list a:hover,
.item-list a:hover {
  color: var(--color-accent);
}

/* 空状态 */
.empty {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

/* 窄屏 */
@media (max-width: 768px) {
  .fiction-view h1 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .collection-list a,
  .item-list a {
    font-size: 0.9375rem;
  }
}
</style>
