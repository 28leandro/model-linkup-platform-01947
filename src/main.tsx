import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { CurrencyProvider } from './contexts/CurrencyContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LanguageProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </LanguageProvider>
  </BrowserRouter>
);
