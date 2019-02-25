type EssenceLocation = { state: any; key: string; } & Location
function getLocation(source: any): EssenceLocation {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  }
}

type EssenceListener = (msg?: { location: EssenceLocation; action: string; }) => void
type EssenceUnlistener = () => void

interface IHistory {
  listen(listener: EssenceListener): EssenceListener
  navigate(to: string, parm: { state: any; replace: boolean; }): void
}

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
    this.source.addListener("popstate", popstateListener)
    return () => {
      this.source.removeEventListener("popstate", popstateListener)
      this.listeners.filter(fn => fn !== listener)
    }
  }

  navigate(to: string, param: { state: any, replace?: boolean }): void {
    const state = param.state
    const replace = param.replace ? param.replace : false
    const keyedState = { ...state, key: `${Date.now()}` }
    try {
      if (replace) {
        this.source.history.replaceState(keyedState, null, to)
      } else {
        this.source.history.pushState(keyedState, null, to)
      }
    } catch (e) {
      this.source.location[replace ? "replace" : "assign"](to);
    }
    this.location = getLocation(this.source)
    const msg = { location: this.location, action: "PUSH" }
    this.listeners.forEach(listener => listener(msg))
  }
}

function createHistory(source: any): IHistory {
  return new EssenceHistory(source)
}

const globalHistory = createHistory(window)
const navigate = globalHistory.navigate

export { globalHistory, navigate, createHistory }