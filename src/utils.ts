function segmentize(uri: string) {
  return uri
    .replace(/(^\/+|\/+$)/g, "")
    .split("/")
}

function startsWith(str: string, prefix: string) {
  return str.substr(0, prefix.length) === prefix
}

function stripSlashes(str: string) {
  return str.replace(/(^\/+|\/+$)/g, "")
}

export {
  segmentize,
  startsWith,
  stripSlashes
}