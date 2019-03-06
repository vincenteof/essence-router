// get customized location object from some `source`
type EssenceLocation = { state: any; key: string; } & Location
function getLocation(source: any): EssenceLocation {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  }
}

// function type definitions related to listeners
type EssenceListener = (msg?: { location: EssenceLocation; action: string; }) => void
type EssenceUnlistener = () => void

// abstract `History` interface
interface IHistory {
  currentLocation: EssenceLocation
  listen(listener: EssenceListener): EssenceListener
  navigate(to: string, parm: { state: any; replace: boolean; }): void
}

// an implementation of `History`
class EssenceHistory implements IHistory {
  source: any
  listeners: EssenceListener[]
  location: EssenceLocation

  constructor(source: any) {
    this.source = source
    this.listeners = []
    this.location = getLocation(source)
  }

  get currentLocation() {
    return this.location
  }

  listen(listener: EssenceListener): EssenceUnlistener {
    this.listeners.push(listener)
    const popstateListener = () => {
      this.location = getLocation(this.source)
      listener({ location: this.location, action: "pop" })
    }
    this.source.addEventListener("popstate", popstateListener)
    return () => {
      this.source.removeEventListener("popstate", popstateListener)
      this.listeners.filter(fn => fn !== listener)
    }
  }

  navigate(to: string, options: { state: any, replace?: boolean }): void {
    const state = options.state
    const replace = options.replace ? options.replace : false
    const keyedState = { ...state, key: `${Date.now()}` }
    try {
      if (replace) {
        this.source.history.replaceState(keyedState, null, to)
      } else {
        this.source.history.pushState(keyedState, null, to)
      }
    } catch (e) {
      this.source.location[replace ? "replace" : "assign"](to)
    }
    this.location = getLocation(this.source)
    const msg = { location: this.location, action: "PUSH" }
    this.listeners.forEach(listener => listener(msg))
  }
}

function createHistory(source: any): IHistory {
  return new EssenceHistory(source)
}

// history instance
const globalHistory = createHistory(window)
const navigate = globalHistory.navigate.bind(globalHistory)

export { globalHistory, navigate, createHistory, EssenceLocation, IHistory }