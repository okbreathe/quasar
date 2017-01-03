const mime = require('mime-types')

export default function markdownitMedia (md, config) {
  config = {
    target: '_blank',
    linkImage: true,
    linkClass: null,
    urlFor: url => url,
    ...config,
  }

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    let filename, url, type
    const token    = tokens[idx],
          srcIndex = token.attrIndex('src'),
          media    = config.urlFor(token.attrs[srcIndex][1]),
          alt      = token.content

    if (typeof(media) == "object") {
      type = mime.lookup(filename = media.filename)
      url = media.url
    } else {
      url = media
      type = mime.lookup(url.split("?")[0]) // Account for query strings
    }

    switch ((type || "").split('/')[0]) {
      case 'audio': return renderAudio(url, type)
      case 'video': return renderVideo(url, type)
      case 'image': return renderImage(url, alt, config)
      default: return `<a href=${url}${filename && ` download='${filename}'`}>${filename || url}</a>`
    }
  }
}

function renderAudio(src, mime){
  return `<audio controls>${renderSource(src, mime)}${noSupport('audio')}</audio>`
}

function renderVideo(src, mime){
  return `<video controls>${renderSource(src, mime)}${noSupport()}</video>`
}

function renderImage(url, alt, config){
  const { target, linkImage, linkClass } = config
  const img = `<img src='${url}' alt='${alt}'/>`
  return linkImage ? `<a href=${url} title="${alt}" target='${target}'${linkClass ? ` class='${linkClass}'` : ''}>${img}</a>` : img
}

function renderSource(src, mime){
  return `<source type="${mime}" src="${src}"></source>`
}

function noSupport(type = 'video'){
  return `Your browser does not support the <code>${type}</code> element.`
}

