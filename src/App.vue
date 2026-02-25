<template>
  <div class="app">
    <AppHeader />
    <main class="main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, provide } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const THEME_KEY = 'site-theme'
const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
}

function applyTheme(dark) {
  const el = document.documentElement
  if (dark) {
    el.setAttribute('data-theme', 'dark')
  } else {
    el.removeAttribute('data-theme')
  }
  try {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  } catch (_) {}
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    isDark.value = saved === 'dark'
  } catch (_) {}
  applyTheme(isDark.value)
})

watch(isDark, applyTheme)

provide('theme', { isDark, toggleTheme })
</script>

<style>
/* 文艺·简洁：纸色背景、衬线字体、柔和对比 */
:root {
  --color-bg: #faf8f5;
  --color-paper: #fffefb;
  --color-text: #2d2a26;
  --color-text-muted: #6b6560;
  --color-accent: #6b5344;
  --color-border: #e8e4df;
  --font-serif: 'Noto Serif SC', 'Source Han Serif CN', Georgia, serif;
  --line-body: 1.78;
  --space-main: 2.5rem;
  --width-content: 42rem;
}

/* 夜间模式 */
[data-theme='dark'] {
  --color-bg: #1c1b1a;
  --color-paper: #252422;
  --color-text: #e8e6e1;
  --color-text-muted: #a39e96;
  --color-accent: #c4b5a0;
  --color-border: #3d3b38;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: var(--line-body);
  -webkit-font-smoothing: antialiased;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 0 0 auto;
  max-width: var(--width-content);
  margin: 0 auto;
  padding: var(--space-main) 1.5rem;
  width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.app > footer {
  margin-top: auto;
}

/* 移动端：缩小内边距、保证触控区域 */
@media (max-width: 768px) {
  :root {
    --space-main: 1.5rem;
  }

  .main {
    padding: var(--space-main) 1rem;
  }
}
</style>
