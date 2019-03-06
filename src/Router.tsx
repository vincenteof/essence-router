import * as React from 'react'
import { Location, LocationContextContent } from './Location'
import { pick, resolve, EssenceRoute } from './match'
import { stripSlashes } from './utils'

// base context contains matched route uri
interface BaseContextContent { baseuri: string; basepath: string }
const BaseContext: React.Context<BaseContextContent> = React.createContext({ baseuri: "/", basepath: "/" })

// the reason why we use `consumer` outside `provider` is to deal with nested routers
// the most outside `consumer` will use the default context value
interface RouterProps {}
const Router = (props: RouterProps) => (
  <BaseContext.Consumer>
    {baseCtx => (
      <Location>
        {locCtx => (
          <RouterImpl {...baseCtx} {...locCtx} {...props} />
        )}
      </Location>
    )}
  </BaseContext.Consumer>
)

type RouterImplProps = LocationContextContent & BaseContextContent

interface RouterImplState { }

// core of the router, which get the matched route and render it
class RouterImpl extends React.PureComponent<RouterImplProps, RouterImplState> {
  render() {
    const {
      location,
      navigate,
      children
    } = this.props
    let basepath = this.props.basepath

    const routes = React.Children.map(children, createRoute(basepath))
    const { pathname } = location
    const match = pick(routes, pathname)

    if (!match) {
      return null
    }

    const {
      route: { value: element },
      route,
      params,
      uri
    } = match

    const props = {
      ...params,
      uri,
      location,
      navigate: (to: string, options: { state: any; replace: boolean }) => navigate(resolve(to, uri), options)
    }

    const cloned = React.cloneElement(
      element,
      props,
      element.props.children ?
        <Router>{element.props.children}</Router> :
        undefined
    )

    if (!route.default) {
      basepath = route.path.replace(/\*$/, "")
    }

    return (
      <BaseContext.Provider value={{ baseuri: uri, basepath }}>
        {cloned}
      </BaseContext.Provider>
    )
  }
}

// TODO: differentce between ReactElement and ReactNode
type ElementToRoute = (element: React.ReactChild) => EssenceRoute | null

// create a route object whose path is formatted using the `basepath`
function createRoute(basepath: string): ElementToRoute {
  return (element: React.ReactElement) => {
    if (!element) {
      return null
    }

    if (element.props.default) {
      return { value: element, default: true }
    }

    const elementPath = element.props.path
    const path = elementPath === "/"
      ? basepath 
      : `${stripSlashes(basepath)}/${elementPath}`

    return {
      value: element,
      default: element.props.default,
      path
    }
  }
}

export {
  Router,
  BaseContext
}