import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  RouterProvider
} from "react-router-dom";
import AuthProvider from './providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { router } from './routes/Routes';

const queryClient = new QueryClient();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
