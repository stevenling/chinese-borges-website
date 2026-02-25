import matter from 'gray-matter'
import YAML from 'yaml'
import { marked } from 'marked'

/** 配置用 slug，不进入文章列表 */
const CONFIG_SLUGS = ['_site', 'poem/_index', 'fiction/_index']

/** 默认顶栏分类顺序（无 _site.md 时使用） */
const DEFAULT_CATEGORIES = ['生平事迹', '诗歌', '小说', '散文', '关于本站']

/** 分类路由使用英文 slug，此处为 slug → 中文名（用于列表页标题与筛选） */
export const CATEGORY_SLUG_TO_NAME = {
  bio: '生平事迹',
  poetry: '诗歌',
  fiction: '小说',
  essays: '散文',
  about: '关于本站',
}

/** 根据中文分类名返回英文 slug，用于生成 /articles/:slug 链接 */
export function getCategorySlug(categoryName) {
  const entry = Object.entries(CATEGORY_SLUG_TO_NAME).find(([, name]) => name === categoryName)
  return entry ? entry[0] : encodeURIComponent(categoryName)
}

/**
 * 二级分类由 Markdown 的 frontmatter 配置：
 * 在 frontmatter 中写 subcategory: true 的文章会作为该 category 下的「二级」项，
 * 在分类列表页和顶栏下拉中显示；未设置 subcategory 的文章不会出现在二级列表中。
 */

// 与 articles.js 同级的 content 目录，使用 ./ 相对路径（Vite 推荐）
// 不使用 eager，统一通过 load() 取 default，避免开发/生产环境差异
const mdModules = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
})

/** 为正文中的绝对路径链接加上 base（部署到 GitHub Pages 子路径时 /article/xxx 会变成 /repo/article/xxx） */
function fixContentBase(html) {
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')
  if (!base) return html
  return html.replace(/href="\//g, `href="${base}/`)
}

/** 将 glob 的 path 转为 slug（兼容开发 ./content/ 与生产可能出现的 / 或 content/ 前缀） */
function pathToSlug(path) {
  return path
    .replace(/\?.*$/, '')
    .replace(/^\.\/content\/?/, '')
    .replace(/^\/?content\/?/, '')
    .replace(/\.md$/i, '')
    .replace(/\.yml$/i, '')
    .replace(/\\/g, '/')
}

export const contentFileCount = Object.keys(mdModules).length

/** 从 content/_site.md 读取顶栏分类与链接配置 */
export async function getSiteConfig() {
  const pathKey = Object.keys(mdModules).find((p) => pathToSlug(p) === '_site')
  if (!pathKey) return { categories: DEFAULT_CATEGORIES, links: {} }
  try {
    const load = mdModules[pathKey]
    let raw = typeof load === 'function' ? await load() : load
    if (raw && typeof raw.then === 'function') raw = await raw
    if (raw && typeof raw === 'object' && 'default' in raw) raw = raw.default
    raw = typeof raw === 'string' ? raw : String(raw ?? '')
    const { data = {} } = matter(raw)
    const categories = Array.isArray(data.categories) ? data.categories : DEFAULT_CATEGORIES
    const links = data.links && typeof data.links === 'object' ? data.links : {}
    return { categories, links }
  } catch (err) {
    console.warn('[articles] 读取 _site 配置失败:', err)
    return { categories: DEFAULT_CATEGORIES, links: {} }
  }
}

/** 从 content/poem/_index.yml 读取诗歌入口与诗集列表配置（显式 import 确保被 Vite 打包） */
export async function getPoetryConfig() {
  const defaultConfig = { title: '诗歌', collections: [{ id: 'La_rosa_profunda', title: '深沉的玫瑰' }] }
  try {
    const mod = await import('./content/poem/_index.yml?raw')
    const raw = (mod && mod.default) ? String(mod.default) : ''
    if (!raw) return defaultConfig
    const data = YAML.parse(raw) || {}
    const title = (data.title && String(data.title).trim()) || '诗歌'
    const collections = Array.isArray(data.collections)
      ? data.collections.filter((c) => c && (c.id || c.title))
      : defaultConfig.collections
    return { title, collections }
  } catch (err) {
    console.warn('[articles] 读取 poem/_index.yml 失败:', err)
    return defaultConfig
  }
}

/** 从 content/fiction/_index.yml 读取小说入口与小说集列表配置（显式 import 确保被 Vite 打包） */
export async function getFictionConfig() {
  const defaultConfig = { title: '小说', collections: [{ id: 'aleph', title: '阿莱夫' }] }
  try {
    const mod = await import('./content/fiction/_index.yml?raw')
    const raw = (mod && mod.default) ? String(mod.default) : ''
    if (!raw) return defaultConfig
    const data = YAML.parse(raw) || {}
    const title = (data.title && String(data.title).trim()) || '小说'
    const collections = Array.isArray(data.collections)
      ? data.collections.filter((c) => c && (c.id || c.title))
      : defaultConfig.collections
    return { title, collections }
  } catch (err) {
    console.warn('[articles] 读取 fiction/_index.yml 失败:', err)
    return defaultConfig
  }
}

/**
 * 获取指定小说集（目录）下的篇目列表，排除 index，标题取自 frontmatter
 * @param {string} collectionId - 如 'aleph'、'the_garden_of_forking_paths'
 * @returns {Promise<Array<{ slug: string, title: string }>>}
 */
export async function getFictionCollectionList(collectionId) {
  const prefix = `./content/fiction/${collectionId}/`
  const paths = Object.keys(mdModules).filter((p) => p.startsWith(prefix) && /\.md$/i.test(p))
  const items = await Promise.all(
    paths.map(async (path) => {
      const slug = pathToSlug(path)
      const base = slug.split('/').pop() || ''
      if (base === 'index') return null
      const filename = path.replace(/^.*[/\\]/, '').replace(/\.md$/i, '')
      let title = filename.replace(/^\d+-/, '') || filename
      try {
        const load = mdModules[path]
        let raw = typeof load === 'function' ? await load() : load
        if (raw && typeof raw.then === 'function') raw = await raw
        if (raw && typeof raw === 'object' && 'default' in raw) raw = raw.default
        raw = typeof raw === 'string' ? raw : String(raw ?? '')
        const { data = {} } = matter(raw)
        if (data.title && String(data.title).trim()) title = String(data.title).trim()
      } catch (_) {}
      return { slug, title }
    })
  )
  const list = items.filter(Boolean)
  return list.sort((a, b) => {
    if (a.title === '序言' && b.title !== '序言') return -1
    if (a.title !== '序言' && b.title === '序言') return 1
    return a.slug.localeCompare(b.slug)
  })
}

export async function getArticleList() {
  const paths = Object.keys(mdModules)
  if (paths.length === 0) return []

  const entries = await Promise.all(
    paths.map(async (path) => {
      try {
        const slug = pathToSlug(path)
        if (CONFIG_SLUGS.includes(slug)) return null
        const load = mdModules[path]
        let raw = typeof load === 'function' ? await load() : load
        if (raw && typeof raw.then === 'function') raw = await raw
        if (raw && typeof raw === 'object' && 'default' in raw) raw = raw.default
        raw = typeof raw === 'string' ? raw : String(raw ?? '')
        const { data: meta = {} } = matter(raw)
        const fallbackTitle = path.replace(/^.*[/\\]/, '').replace(/\.md$/i, '')
        let category = (meta && meta.category) ? String(meta.category).trim() : ''
        if (!category && slug.startsWith('essays/')) category = '散文'
        const subcategory = meta && (meta.subcategory === true || meta.subcategory === 'true')
        const parentSlug = (meta && meta.parentSlug) ? String(meta.parentSlug).trim() : ''
        const titleFromMeta = (meta && meta.title) || ''
        const title = titleFromMeta || (slug.startsWith('essays/') ? (fallbackTitle.replace(/^\d+-/, '') || fallbackTitle) : fallbackTitle)
        return {
          slug,
          title,
          date: (meta && meta.date) || '',
          summary: (meta && meta.summary) || '',
          category,
          subcategory: !!subcategory,
          parentSlug: parentSlug || undefined,
        }
      } catch (err) {
        console.warn('[articles] 解析失败:', path, err)
        return null
      }
    })
  )
  const list = entries.filter(Boolean)
  return list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
}

/**
 * 获取指定诗歌集（目录）下的篇目列表，标题为文件名（不含 .md）
 * @param {string} collectionId - 如 'La_rosa_profunda'
 * @returns {Array<{ slug: string, title: string }>}
 */
export function getPoemCollectionList(collectionId) {
  const prefix = `./content/poem/${collectionId}/`
  const paths = Object.keys(mdModules).filter((p) => p.startsWith(prefix) && /\.md$/i.test(p))
  return paths
    .map((path) => {
      const slug = pathToSlug(path)
      const filename = path.replace(/^.*[/\\]/, '').replace(/\.md$/i, '')
      const title = filename.replace(/^\d+-/, '') || filename
      return { slug, title }
    })
    .filter((item) => {
      const base = item.slug.split('/').pop() || ''
      return base !== 'index'
    })
    .sort((a, b) => {
      if (a.title === '序言' && b.title !== '序言') return -1
      if (a.title !== '序言' && b.title === '序言') return 1
      return a.slug.localeCompare(b.slug)
    })
}

/**
 * 从 index.md 正文中解析「目录」顺序：按正文里 /article/xxx 链接出现顺序返回 slug 数组
 * 用于散文（如 essays/history_of_eternity/index）与诗歌（如 poem/La_rosa_profunda/index）的「下一篇」顺序
 * @param {string} indexSlug - 如 'essays/history_of_eternity/index' 或 'poem/La_rosa_profunda/index'
 * @returns {Promise<string[]>}
 */
export async function getOrderedSlugsFromIndex(indexSlug) {
  const pathKey = Object.keys(mdModules).find((p) => pathToSlug(p) === indexSlug)
  if (!pathKey) return []
  try {
    const load = mdModules[pathKey]
    let raw = typeof load === 'function' ? await load() : load
    if (raw && typeof raw.then === 'function') raw = await raw
    if (raw && typeof raw === 'object' && 'default' in raw) raw = raw.default
    raw = typeof raw === 'string' ? raw : String(raw ?? '')
    const { content = '' } = matter(raw)
    const slugs = []
    const re = /\]\(\/article\/([^)]+)\)/g
    let m
    while ((m = re.exec(content)) !== null) slugs.push(m[1])
    return slugs
  } catch (err) {
    console.warn('[articles] 解析 index 顺序失败:', indexSlug, err)
    return []
  }
}

export async function getArticleBySlug(slug) {
  const decoded = decodeURIComponent(slug)
  const decodedNFC = decoded.normalize('NFC')
  const pathKey = Object.keys(mdModules).find((p) => {
    const s = pathToSlug(p).normalize('NFC')
    return s === decodedNFC || s === decoded
  })
  if (!pathKey) return null
  try {
    const load = mdModules[pathKey]
    let raw = typeof load === 'function' ? await load() : load
    if (raw && typeof raw.then === 'function') raw = await raw
    if (raw && typeof raw === 'object' && 'default' in raw) raw = raw.default
    raw = typeof raw === 'string' ? raw : String(raw ?? '')
    const { data: meta = {}, content } = matter(raw)
    let html = marked(content || '')
    // 子路径部署（如 GitHub Pages /repo-name/）时，为正文内 /article/xxx 等绝对链接加上 base，避免点链接 404
    html = fixContentBase(html)
    let category = (meta && meta.category) ? String(meta.category).trim() : ''
    if (!category && decoded.startsWith('essays/')) category = '散文'
    const parentSlug = (meta && meta.parentSlug) ? String(meta.parentSlug).trim() : ''
    let title = (meta && meta.title) ? String(meta.title).trim() : ''
    if (!title && decoded.startsWith('poem/')) {
      const lastSegment = decoded.split('/').pop() || ''
      title = lastSegment.replace(/^\d+-/, '') || lastSegment || decoded
    }
    if (!title && decoded.startsWith('essays/')) {
      const lastSegment = decoded.split('/').pop() || ''
      title = lastSegment.replace(/^\d+-/, '') || lastSegment || decoded
    }
    if (!title) title = decoded
    return {
      slug,
      title,
      date: (meta && meta.date) || '',
      category,
      parentSlug: parentSlug || undefined,
      content: html,
    }
  } catch (err) {
    console.warn('[articles] 加载失败:', pathKey, err)
    return null
  }
}
