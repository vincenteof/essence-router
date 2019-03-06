import * as React from 'react'
import { BaseContext } from './Router'
import { Location } from './Location'
import { resolve } from './match'

interface LinkProps {
  to: string,
  innerRef?: React.RefObject<any>,
  state?: object,
  replace?: boolean,
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void,
  children?: React.ReactNode
}

// it's a wrapper of `<a>`, whose `onClick` is to make all Routers to rerender
const Link = React.forwardRef(({ innerRef, ...props }: LinkProps, ref) => {
  return (
    <BaseContext.Consumer>
      {({ baseuri }) => (
        <Location>
          {({ navigate }) => {
            const { to, state, replace, onClick } = props
            const href = resolve(to, baseuri)

            return (
              <a
                ref={ref || innerRef}
                href={href}
                onClick={event => {
                  if (onClick) {
                    onClick(event)
                  }
                  if (shouldNavigate(event)) {
                    event.preventDefault()
                    navigate(href, { state, replace })
                  }
                }}
              >
                {props.children}
              </a>
            )
          }}
        </Location>
      )}
    </BaseContext.Consumer>
  )
})

const shouldNavigate = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

export {
  Link
}