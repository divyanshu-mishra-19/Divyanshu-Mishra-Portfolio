import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PortfolioDataProvider } from './context/PortfolioDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PortfolioDataProvider>
      <App />
    </PortfolioDataProvider>
  </StrictMode>,
)

