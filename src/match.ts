import * as React from 'react'
import { segmentize, startsWith } from './utils'

interface EssenceRoute {
  default?: boolean
  path?: string,
  value: React.ReactElement,
}

interface Match {
  route: EssenceRoute
  params: {},
  uri: string
}

// ------ matching algorithm
function pick(routes: EssenceRoute[], uri: string): Match | null {
  let match
  let default_

  const [uriPathname] = uri.split("?")
  const uriSegments = segmentize(uriPathname)
  const isRootUri = uriSegments[0] === ""
  const ranked = rankRoutes(routes)

  for (let i = 0; i < ranked.length; i++) {
    const route = ranked[i].route
    if (route.default) {
      default_ = {
        route,
        params: {},
        uri
      }
      continue
    }

    const routeSegments = segmentize(route.path)
    const params: { [key: string]: any } = {}
    const max = Math.max(uriSegments.length, routeSegments.length)
    let missed = false
    let j = 0

    for (; j < max; j++) {
      const routeSeg = routeSegments[j]
      const uriSeg = uriSegments[j]

      const isSplat = routeSeg === "*"
      if (isSplat) {
        params["*"] = routeSegments
          .slice(j)
          .map(decodeURIComponent)
          .join("/")
        break
      }

      if (!uriSeg) {
        missed = true
        break
      }

      const dynamicMatch = paramRe.exec(routeSeg)
      if (dynamicMatch && !isRootUri) {
        const value = decodeURIComponent(uriSeg)
        params[dynamicMatch[1]] = value
      } else if (routeSeg !== uriSeg) {
        missed = true
        break
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: "/" + uriSegments.slice(0, j).join("/")
      }
      break
    }
  }

  return match || default_ || null
}
// ------


// ------ algorithm to rank different routes based on path
function rankRoutes(routes: EssenceRoute[]) {
  return routes
    .map(rank)
    .sort((a, b) => b.score - a.score)
}

function rank(route: EssenceRoute, index: number) {
  let score = 0
  if (!route.default) {
    score = segmentize(route.path).reduce((sum, seg) => {
      sum += SEGMENT_POINTS
      for (const [test, score] of testWithScores) {
        if (test(seg)) {
          sum += score
          break
        }
      }
      return sum
    }, 0)
  }
  return { route, score, index }
}

const paramRe = /^:(.+)/

const SEGMENT_POINTS = 4
const STATIC_POINTS = 3
const DYNAMIC_POINTS = 2
const SPLAT_PENALTY = 1
const ROOT_POINTS = 1

const isRootSegment = (segment: string) => segment === ""
const isDynamic = (segment: string) => paramRe.test(segment)
const isSplat = (segment: string) => segment === "*"
const isStatic = (_: string) => true

const testWithScores: Array<[(seg: string) => boolean, number]> = [
  [isStatic, STATIC_POINTS],
  [isSplat, -(SEGMENT_POINTS + SPLAT_PENALTY)],
  [isDynamic, DYNAMIC_POINTS],
  [isRootSegment, ROOT_POINTS]
]
// ------


// ------ get the formatted absolute path
function resolve(to: string, base: string) {
  if (startsWith(to, "/")) {
    return to
  }

  const [toPathname, toQuery] = to.split("?")
  const [basePathname] = base.split("?")

  const toSegments = segmentize(toPathname)
  const baseSegments = segmentize(basePathname)

  // to: ?a=b
  if (toSegments[0] === "") {
    return addQuery(basePathname, toQuery)
  }

  // to: somepath
  if (!startsWith(toSegments[0], ".")) {
    const pathname = baseSegments.concat(toSegments).join("/")
    return addQuery("/" + pathname, toQuery)
  }

  // to: somepath with `.` and `..`
  const allSegments = baseSegments.concat(toSegments)
  const segments: string[] = []
  allSegments.forEach(seg => {
    if (seg === "..") {
      segments.pop()
    } else if (seg !== ".") {
      segments.push(seg)
    }
  })

  return addQuery("/" + segments.join("/"), toQuery)
}

const addQuery = (pathname: string, query: string) => pathname + (query ? `${query}` : "")
// ------


export {
  pick,
  resolve,
  EssenceRoute
}