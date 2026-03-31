import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NotificationProvider } from "./components/NotificationContext"
import AuthProvider from "./components/AuthProvider" 
import PropsProvider from './components/PropsProvider'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { DirectionProvider } from "@/components/ui/direction"

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <DirectionProvider>
        <PropsProvider>
          <NotificationProvider>
            <TooltipProvider>
              <QueryClientProvider  client={queryClient}>
                <App />
              </QueryClientProvider>
            </TooltipProvider>
          </NotificationProvider>
        </PropsProvider>
      </DirectionProvider>
    </AuthProvider>
  </StrictMode>
)
