import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import App from './App';
import './styles/sync.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-right"
            containerStyle={{ zIndex: 10000 }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
                fontSize: '13.5px',
                fontWeight: 500,
              },
            }}
          />
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  </StrictMode>
);
