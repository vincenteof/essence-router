import * as React from 'react'

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

function pick(routes: EssenceRoute[], uri: string): Match | null {
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].path === uri) {
      return {
        route: routes[i],
        params: {},
        uri
      }
    }
  }
  return null
}

function match(path: string, uri: string): EssenceRoute {
  return {
    path: "/",
    value: React.createElement('div')
  }
}

export {
  pick,
  match,
  EssenceRoute
}