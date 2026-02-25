import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/poem', name: 'Poem', component: () => import('@/views/PoemView.vue') },
  { path: '/poem/:collectionId', name: 'PoemCollection', component: () => import('@/views/PoemView.vue') },
  { path: '/fiction', name: 'Fiction', component: () => import('@/views/FictionView.vue') },
  { path: '/fiction/:collectionId', name: 'FictionCollection', component: () => import('@/views/FictionView.vue') },
  { path: '/articles', name: 'Articles', component: () => import('@/views/ArticlesView.vue') },
  { path: '/articles/:category', name: 'ArticlesByCategory', component: () => import('@/views/ArticlesView.vue') },
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
