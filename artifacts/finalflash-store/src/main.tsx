import { createRoot } from 'react-dom/client';

import App from './App';
import AdminApp from './AdminApp';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const isAdminRoute =
  window.location.pathname === '/admin' ||
  window.location.pathname.startsWith('/admin') ||
  window.location.hash === '#admin';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    {isAdminRoute ? <AdminApp /> : <App />}
  </ErrorBoundary>,
);
