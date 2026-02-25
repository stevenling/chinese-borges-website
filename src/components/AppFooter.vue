<template>
  <footer class="footer">
    <p>你是漫山遍野的喜欢呀～</p>
  </footer>
</template>

<script setup>
</script>

<style scoped>
/* 页脚容器 */
.footer {
  border-top: 1px solid var(--color-border); /* 与主内容区的顶部分隔线 */
  padding: 0.3rem 1.5rem;
  text-align: center;
  color: var(--color-text-muted); /* 弱化字色，不抢正文 */
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  background: var(--color-paper); /* 与顶栏一致的纸白背景 */
}

@media (max-width: 768px) {
  .footer {
    padding: 0.15rem 1rem;
  }
}
</style>
