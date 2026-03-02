import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  // 诗歌：入口 → 诗集目录 → 诗集内单篇（三者在 /poem 下，单篇用 ArticleView）
  { path: '/poem', name: 'Poem', component: () => import('@/views/PoemIndexView.vue') },
  { path: '/poem/:collectionId/:articleSlug(.*)', name: 'PoemArticle', component: () => import('@/views/ArticleView.vue') },
  { path: '/poem/:collectionId', name: 'PoemCollection', component: () => import('@/views/PoemCollectionView.vue') },
  // 小说：入口 → 小说集目录
  { path: '/fiction', name: 'Fiction', component: () => import('@/views/FictionIndexView.vue') },
  { path: '/fiction/:collectionId', name: 'FictionCollection', component: () => import('@/views/FictionCollectionView.vue') },
  // 文章：总览 / 按分类列表
  { path: '/articles', name: 'Articles', component: () => import('@/views/ArticlesView.vue') },
  { path: '/articles/:category', name: 'ArticlesByCategory', component: () => import('@/views/ArticlesView.vue') },
  // 单篇正文（通用 slug，诗歌也可走 /poem/:cid/:articleSlug）
  { path: '/article/:slug(.*)', name: 'Article', component: () => import('@/views/ArticleView.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
