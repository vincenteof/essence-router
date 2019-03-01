function segmentize(uri: string) {
  return uri
    .replace(/(^\/+|\/+$)/g, "")
    .split("/")
}

function startsWith(str: string, prefix: string) {
  return str.substr(0, prefix.length) === prefix
}

export {
  segmentize,
  startsWith
}