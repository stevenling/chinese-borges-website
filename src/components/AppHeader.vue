<!--
  顶栏组件：Logo、导航（首页 + 分类，有 subcategory 时显示下拉）、主题切换。
  移动端（≤768px）显示汉堡按钮，导航变为右侧滑出面板，点击遮罩关闭。
-->
<template>
  <header class="header">
    <RouterLink to="/" class="logo">博尔赫斯中文站</RouterLink>
    <!-- 移动端展开导航时的半透明遮罩，点击关闭菜单 -->
    <div v-if="navOpen" class="nav-overlay" aria-hidden="true" @click="navOpen = false"></div>
    <div class="header-actions">
      <!-- 汉堡按钮：仅小屏显示，控制 .nav 的展开/收起 -->
      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="navOpen"
        aria-label="打开或关闭导航菜单"
        @click="navOpen = !navOpen"
      >
        <svg class="menu-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </button>
      <nav class="nav" :class="{ 'nav-open': navOpen }">
        <RouterLink to="/" @click="navOpen = false">首页</RouterLink>
        <!-- 按 _site.md 的 categories 顺序渲染：有二级则下拉，无则单链接 -->
        <template v-for="cat in siteConfig.categories" :key="cat">
          <div v-if="categoryChildren(cat).length > 0" class="nav-dropdown">
            <RouterLink :to="navLink(cat)" class="nav-trigger" @click="navOpen = false">{{ cat }}</RouterLink>
            <ul class="nav-children">
              <li v-for="child in categoryChildren(cat)" :key="child.slug">
                <RouterLink :to="`/article/${encodeURIComponent(child.slug)}`" @click="navOpen = false">{{ child.title }}</RouterLink>
              </li>
            </ul>
          </div>
          <RouterLink v-else :to="navLink(cat)" @click="navOpen = false">{{ cat }}</RouterLink>
        </template>
      </nav>
      <!-- 日/夜主题切换，依赖 App 提供的 theme inject -->
      <button type="button" class="theme-toggle" :title="theme.isDark.value ? '切换到日间模式' : '切换到夜间模式'" @click="theme.toggleTheme" aria-label="切换日间/夜间模式">
        <span v-if="theme.isDark.value" class="theme-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></span>
        <span v-else class="theme-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { getArticleList, getSiteConfig, getCategorySlug } from '@/articles'

/** 主题：由 App.vue provide，含 isDark、toggleTheme */
const theme = inject('theme', { isDark: ref(false), toggleTheme: () => {} })
/** 全站文章列表，用于筛出各分类下 subcategory 的项（下拉子链接） */
const articles = ref([])
/** 站点配置：来自 _site.md 的 categories 顺序与 links 覆盖 */
const siteConfig = ref({ categories: [], links: {} })
/** 移动端导航折叠面板是否展开；展开时 body 禁止滚动 */
const navOpen = ref(false)

/** 某分类下作为「二级」展示的文章（category 匹配且 subcategory 为 true） */
const categoryChildren = computed(() => (cat) => {
  return articles.value.filter((a) => a.category === cat && a.subcategory)
})

/** 分类点击后的目标：优先用 _site links[cat]，否则 /articles/:slug */
function navLink(cat) {
  const link = siteConfig.value.links[cat]
  if (link) return link
  return `/articles/${getCategorySlug(cat)}`
}

onMounted(async () => {
  const [list, config] = await Promise.all([getArticleList(), getSiteConfig()])
  articles.value = list
  siteConfig.value = config
})

/** 移动端展开菜单时禁止背景滚动，关闭时恢复 */
watch(navOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<style scoped>
/* 顶栏容器：左右分布，底部分隔线 */
.header {
  border-bottom: 1px solid var(--color-border);
  padding: 1.125rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-paper);
}

.logo {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: 0.04em;
}

/* 右侧区域：汉堡按钮 + 导航 + 主题按钮 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

/* 汉堡按钮：默认隐藏，仅 ≤768px 显示 */
.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  flex-shrink: 0;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}

.menu-toggle:hover {
  color: var(--color-text);
}

.menu-toggle-icon {
  display: block;
  line-height: 0;
}

/* 导航：桌面端横向排列，可换行 */
.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.nav a {
  white-space: nowrap;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.nav a.router-link-active {
  color: var(--color-text);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  padding: 0.4rem;
  flex-shrink: 0;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
}

.theme-toggle:hover {
  color: var(--color-text);
}

.theme-icon {
  display: inline-flex;
  line-height: 0;
}

/* 有二级的分类：相对定位，子菜单绝对定位在下方 */
.nav-dropdown {
  position: relative;
}

/* 下拉子菜单：默认隐藏，hover 时显示（桌面端） */
.nav-children {
  position: absolute;
  top: 100%;
  left: 0;
  margin: 0.25rem 0 0;
  padding: 0.375rem 0;
  list-style: none;
  background: var(--color-paper);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(45, 42, 38, 0.06);
  min-width: 10rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 10;
}

.nav-children li {
  margin: 0;
}

.nav-children a {
  display: block;
  padding: 0.4rem 1rem;
  white-space: nowrap;
  font-size: 0.9375rem;
}

/* ---------- 小屏（≤768px）：汉堡按钮 + 右侧滑出导航 ---------- */
@media (max-width: 768px) {
  .header {
    padding: 0.5rem 1rem;
  }

  .logo {
    font-size: 1rem;
  }

  .menu-toggle {
    display: inline-flex;
  }

  /* 导航变为固定右侧面板，.nav-open 时显示 */
  .nav {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(85vw, 18rem);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 3.5rem 1rem 1.5rem;
    background: var(--color-paper);
    border-left: 1px solid var(--color-border);
    box-shadow: -4px 0 16px rgba(45, 42, 38, 0.08);
    z-index: 100;
    overflow-y: auto;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }

  .nav.nav-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .nav a,
  .nav .nav-trigger {
    display: block;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 1rem;
  }

  .nav-dropdown {
    border-bottom: 1px solid var(--color-border);
  }

  .nav-children {
    position: static;
    margin: 0 0 0.5rem;
    padding: 0 0 0 1rem;
    box-shadow: none;
    border: none;
    min-width: 0;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .nav-children a {
    padding: 0.4rem 0;
    border-bottom: none;
  }

  .theme-toggle {
    margin-left: 0;
  }

  /* 遮罩层：盖住主内容，点击关闭菜单 */
  .nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(45, 42, 38, 0.25);
    z-index: 99;
  }
}
</style>
