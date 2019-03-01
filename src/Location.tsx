import * as React from 'react'
import { EssenceLocation, navigate, globalHistory, IHistory } from './history'

// ------ type definition
interface LocationContextContent {
  location?: EssenceLocation
  navigate?: typeof navigate
}

const LocationContext: React.Context<LocationContextContent> = React.createContext(undefined)
// ------



// ------ LocationConsumer
interface LocationProps { children: (ctx: LocationContextContent) => React.ReactElement }

const Location = (props: LocationProps) => {
  let LocationComsumer = LocationContext.Consumer
  return (
    <LocationComsumer>
      {context =>
        context ? (
          props.children(context)
        ) : (
            <LocationProvider>{props.children}</LocationProvider>
          )
      }
    </LocationComsumer>
  )
}
// ------



// ------ LocationProvider
interface LocationProviderProps {
  history: IHistory
}

interface LocationProviderState {
  context: LocationContextContent
  refs: { unlisten: () => void }
}

class LocationProvider extends React.Component<LocationProviderProps, LocationProviderState> {
  static defaultProps = {
    history: globalHistory
  }

  unmounted = false

  state = {
    context: this.getContext(),
    refs: { unlisten: () => { } }
  }

  getContext() {
    const { navigate, currentLocation } = this.props.history
    return {
      navigate: navigate.bind(this.props.history),
      location: currentLocation
    }
  }

  componentDidMount() {
    const {
      props: { history },
      state: { refs }
    } = this

    refs.unlisten = history.listen(() => {
      if (!this.unmounted) {
        this.setState({
          context: this.getContext()
        })
      }
    })
  }

  componentWillUnmount() {
    let {
      state: { refs }
    } = this
    this.unmounted = true
    refs.unlisten()
  }

  render() {
    let {
      state: { context },
      props: { children }
    } = this
    return (
      <LocationContext.Provider value={context}>
        {typeof children === "function" ? children(context) : children || null}
      </LocationContext.Provider>
    )
  }
}
// ------


export {
  LocationContextContent,
  Location,
  LocationProvider
}