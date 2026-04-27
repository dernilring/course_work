import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { FilmProvider } from './context/FilmContext.jsx'


createRoot(document.getElementById('root')).render(
  <FilmProvider>
    <App />
  </FilmProvider>,
)
