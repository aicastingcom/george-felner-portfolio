import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { error: Error | null }

/** Stops a single WebGL crash from blanking the whole site */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              minHeight: '100vh',
              display: 'grid',
              placeItems: 'center',
              background: '#000',
              color: '#fff',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem' }}>Something failed to render.</p>
              <p style={{ color: '#999', fontSize: '0.85rem' }}>{this.state.error.message}</p>
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                style={{
                  marginTop: '1rem',
                  padding: '0.6rem 1rem',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
