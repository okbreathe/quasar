import React from "react"
import MarkdownIt from 'markdown-it'
import mdSup from 'markdown-it-sup'
import mdSub from 'markdown-it-sub'
import mdTasks from 'markdown-it-task-lists'
import hljs from 'highlight.js'

import { StyleUnits } from '../../constants'
import mdMedia from '../../lib/markdown-it-media'

const md = new MarkdownIt({
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(lang, str, true).value + '</code></pre>'
      } catch (_err) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})
.use(mdMedia, { urlFor: process.env.TRANSIENT ? require("../../lib/backends/transient").objectURL : f => f })
.use(mdSup)
.use(mdSub)
.use(mdTasks, { enabled: true })

// Styles are encoded in the following manner
// [id].[property].[children,]?
//
// id - the id of the element to style
// property - the CSS property
// children - optional comma separated list of children to apply styles to rather than parent
const generateStyles = (ui) => {
  const buildRule = (id, selector, property, value) => {
    return `#${id} ${selector}{ ${property}: ${value}; }`
  }

  const style = Object.keys(ui).reduce((s, k) => {
    if (/^preview\./.test(k)) {
      const [id, property, children] = k.split(".")
      const val   = ui[k]
      const unit  = StyleUnits[property] || ''
      const value = typeof unit == "function" ? unit(val) : `${val}${unit}`
      const arr = (children || "").split(",")
      arr.forEach(selector => s += buildRule(id, selector, property.replace("_", "-"), value))
    }
    return s
  }, "")

  return style
}

export const Preview = (props) => {
  const { id = "page-view", ui , content = "", onScroll } = props
  const getRatio = (el) => el.scrollTop / (el.scrollHeight - el.clientHeight)

  return (
    <div id={id} className='page-panel page-view' onScroll={e => onScroll(e.target, getRatio(e.target))}>
      <div id='preview' dangerouslySetInnerHTML={{__html: content ? md.render(content) : "" }} />
      <style>{generateStyles(ui)}</style>
    </div>
  )
}
