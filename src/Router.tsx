import * as React from 'react'
import { Location, LocationContextContent } from './Location'
import { pick, EssenceRoute } from './match'

interface BaseContextContent { baseuri: string; basepath: string }

const BaseContext: React.Context<BaseContextContent>  = React.createContext({ baseuri: "/", basepath: "/" })

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

interface RouterImplState {}

class RouterImpl extends React.PureComponent<RouterImplProps, RouterImplState> {
    render() {
        const {
            location,
            navigate,
            basepath,
            baseuri,
            children
        } = this.props

        const routes = React.Children.map(children, createRoutes(basepath))
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

        const props = {}
        const cloned = React.cloneElement(
            element,
            props,
        )


        return (
            <BaseContext.Provider value={{ baseuri: uri, basepath }}>
                {cloned}
            </BaseContext.Provider>
        )
    }
}

// TODO: differentce between ReactElement and ReactNode
type ElementToRoute = (element: React.ReactChild) => EssenceRoute | null

function createRoutes(basepath: string): ElementToRoute {
    return (element: React.ReactElement) => {
        if (!element) {
            return null
        }

        if (element.props.default) {
            return { value: element, default: true }
        }

        const path = basepath + element.props.path
        return { 
            value: element, 
            default: element.props.default,
            path 
        }
    }
}

export {
    Router
}