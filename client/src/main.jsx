import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#FFFFFF',
                            color: '#0F172A',
                            border: '1px solid #E2E8F0',
                        },
                        success: {
                            iconTheme: {
                                primary: '#22C55E',
                                secondary: '#F1F5F9',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#F1F5F9',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)
