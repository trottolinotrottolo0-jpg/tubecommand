import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Bypass della pagina di avviso ngrok: aggiunge l'header su ogni richiesta verso il backend tunnel.
const __origFetch = window.fetch.bind(window)
window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url && url.includes('ngrok')) {
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined))
    headers.set('ngrok-skip-browser-warning', 'true')
    init = { ...init, headers }
  }
  return __origFetch(input as RequestInfo, init)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
