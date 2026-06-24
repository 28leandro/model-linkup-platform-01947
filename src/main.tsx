import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initPwaUpdate } from './lib/pwaUpdate'

const queryClient = new QueryClient()

initPwaUpdate()

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </HelmetProvider>
);
