import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import { store } from './store/store';
import App from './App';
import './index.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL with error handling
msalInstance.initialize()
  .then(() => {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }

    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        // @ts-ignore
        const account = event.payload.account;
        msalInstance.setActiveAccount(account);
      }
    });

    // Render the app
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <Provider store={store}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
        </MsalProvider>
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error('MSAL initialization failed:', error);

    // Show error message to user
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f5f5; font-family: Arial, sans-serif;">
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px; text-align: center;">
            <h2 style="color: #d32f2f; margin-bottom: 1rem;">⚠️ Initialization Error</h2>
            <p style="margin-bottom: 1rem; color: #666;">
              Unable to initialize authentication. This may be due to browser storage restrictions.
            </p>
            <p style="margin-bottom: 1rem; color: #666; font-size: 0.9rem;">
              <strong>Please try:</strong><br/>
              1. Ensure you're accessing the app via http:// or https:// (not file://)<br/>
              2. Check that cookies and storage are enabled in your browser<br/>
              3. Try using a different browser or incognito mode<br/>
              4. Clear your browser cache and reload
            </p>
            <button 
              onclick="window.location.reload()" 
              style="background: #1976d2; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem;"
            >
              Reload Page
            </button>
            <details style="margin-top: 1rem; text-align: left;">
              <summary style="cursor: pointer; color: #666; font-size: 0.9rem;">Technical Details</summary>
              <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; margin-top: 0.5rem;">${error.message || error}</pre>
            </details>
          </div>
        </div>
      `;
    }
  });
