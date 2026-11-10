import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

interface ErrorBoundaryState { error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('VIGILIA — erreur de démarrage', error, info)
  }

  render() {
    if (this.state.error) {
      return <main className="startup-error">
        <div className="startup-error-mark">V</div>
        <h1>VIGILIA n’a pas pu démarrer</h1>
        <p>{this.state.error.message}</p>
        <button onClick={() => window.location.reload()}>Recharger l’application</button>
      </main>
    }
    return this.props.children
  }
}

const root = document.getElementById('root')
if (!root) throw new Error('Élément racine introuvable')

createRoot(root).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>)
