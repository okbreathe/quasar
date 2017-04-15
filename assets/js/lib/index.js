export * from './queue'

export const pathFor = (function (root){
  return (path) => path && root == "/" ? path : [root, path].filter(p => p).join("")
})((process.env.APP_ROOT).trim())

export function compareStrings(a, b, field, direction){
  const valA = ( a.attributes[field] || "" ).toString().toUpperCase()
  const valB = ( b.attributes[field] || "" ).toString().toUpperCase()
  const dir  =  direction == 'ASC' ? 1 : -1
  return valA < valB ? (dir * -1) : (valA > valB ? dir : 0)
}

export function compareDates(a, b, field, direction){
  const valA = new Date(a.attributes[field]).getTime()
  const valB = new Date(b.attributes[field]).getTime()
  const dir  =  direction == 'ASC' ? 1 : -1
  return valA < valB ? (dir * -1) : (valA > valB ? dir : 0)
}

export function dataURLToBlob(dataURL) {
  var BASE64_MARKER = ';base64,'
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',')
    var contentType = parts[0].split(':')[1]
    var raw = parts[1]

    return new Blob([raw], {type: contentType})
  }

  var parts = dataURL.split(BASE64_MARKER)
  var contentType = parts[0].split(':')[1]
  var raw = window.atob(parts[1])
  var rawLength = raw.length

  var uInt8Array = new Uint8Array(rawLength)

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], {type: contentType})
}

// Return an new object containing only the specified keys
export function only(obj, ...keys) {
  return keys.reduce((acc, key) => { acc[key] = obj[key]; return acc }, {})
}

// Return an new object containing all the keys BUT the specified
export function except(obj, ...keys) {
  return keys.reduce((acc, key) => { delete acc[key]; return acc }, {...obj})
}

// http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
export function shadeBlendConvert(p, from, to) {
  if (typeof(p) != "number" || p < -1 || p > 1 || typeof(from) != "string" || (from[0] != 'r' && from[0] != '#') || (typeof(to) != "string" && typeof(to) != "undefined")) return null //ErrorCheck

  var r = Math.round,
    h = from.length > 9,
    h = typeof(to) == "string" ? to.length > 9 ? true : to == "c" ? !h : false : h,
    b = p < 0,
    p = b ? p * -1 : p,
    to = to && to != "c" ? to : b ? "#000000" : "#FFFFFF",
    f = sbcRip(from),
    t = sbcRip(to)

  if (!f || !t) return null //ErrorCheck

  if (h) {
    return "rgb(" + r((t[0] - f[0]) * p + f[0]) + "," + r((t[1] - f[1]) * p + f[1]) + "," + r((t[2] - f[2]) * p + f[2]) + (f[3] < 0 && t[3] < 0 ? ")" : "," + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 10000) / 10000 : t[3] < 0 ? f[3] : t[3]) + ")")
    } else {
      return "#" + (0x100000000 + (f[3] > -1 && t[3] > -1 ? r(((t[3] - f[3]) * p + f[3]) * 255) : t[3] > -1 ? r(t[3] * 255) : f[3] > -1 ? r(f[3] * 255) : 255) * 0x1000000 + r((t[0] - f[0]) * p + f[0]) * 0x10000 + r((t[1] - f[1]) * p + f[1]) * 0x100 + r((t[2] - f[2]) * p + f[2])).toString(16).slice(f[3] > -1 || t[3] > -1 ? 1 : 3)
    }
}

function sbcRip(d) {
  var l = d.length,
    RGB = new Object()

  if (l > 9) {
    d = d.split(",")
    if (d.length < 3 || d.length > 4) return null //ErrorCheck
    RGB[0] = parseInt(d[0].slice(4)), RGB[1] = parseInt(d[1]), RGB[2] = parseInt(d[2]), RGB[3] = d[3] ? parseFloat(d[3]) : -1
  } else {
    if (l == 8 || l == 6 || l < 4) return null //ErrorCheck
    if (l < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (l > 4 ? d[4] + "" + d[4] : "") //3 digit
    d = parseInt(d.slice(1), 16), RGB[0] = d >> 16 & 255, RGB[1] = d >> 8 & 255, RGB[2] = d & 255, RGB[3] = l == 9 || l == 5 ? r(((d >> 24 & 255) / 255) * 10000) / 10000 : -1
  }
  return RGB
}

export default {
  only,
  except,
  pathFor,
  compareStrings,
  compareDates,
  dataURLToBlob,
  shadeBlendConvert,
}
