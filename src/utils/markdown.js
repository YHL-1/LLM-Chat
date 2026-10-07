import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mdLinkAttributes from 'markdown-it-link-attributes'
import { full as emoji } from 'markdown-it-emoji'
// 代码块明暗主题由 ChatMessage.scss 中的 CSS 变量提供，不再全局引入单一主题
import copyIcon from '../assets/images/复制.png'
import darkIcon from '../assets/images/暗黑模式.png'
import lightIcon from '../assets/images/明亮模式.png'

export const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    highlight(str, lang) {
        let isDark = false
        try {
            isDark = localStorage.getItem('code-theme') === 'dark'
        } catch (error) {
            console.error('主题偏好读取失败:', error)
            isDark = false
        }
        const themeIcon = isDark ? lightIcon : darkIcon

        const header = `<div class="code-header">
                <span class="code-lang">${lang}</span>
                <div class="code-actions">
                <button class="code-action-btn" data-action="copy" data-tooltip="复制">
                <img src="${copyIcon}" alt="copy" />
                </button>
                <button class="code-action-btn" data-action="theme" data-tooltip="切换主题">
                <img src="${themeIcon}" alt="theme" data-light-icon="${lightIcon}" data-dark-icon="${darkIcon}" />
                </button>
                </div>
                </div>`

        if (lang && hljs.getLanguage(lang)) {
            try {
                const highlighted = hljs.highlight(str, {
                    language: lang,
                    ignoreIllegals: true,
                }).value
                // 结构标签之间不留任何空白，避免生成匿名块盒导致出现白边
                return `<div class="code-block${isDark ? ' dark-theme' : ''}">${header}<pre class="hljs"><code>${highlighted}</code></pre></div>`
            } catch (error) {
                console.log('markdown工具函数：'+error)
                return ''
            }
        }
        // 未指定语言：同样包入 code-block 以获得主题配色，但不显示头部
        return `<div class="code-block${isDark ? ' dark-theme' : ''}"><pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre></div>`
    },
})

md.use(mdLinkAttributes, {
    attrs: {
        target: '_blank',
        rel: 'noopener',
    },
})

md.use(emoji)

export const renderMarkdown = (content) => {
    if (!content) return ''
    return md.render(content)
}
