import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from './authConfig';
import { syncUser, logout } from './store/slices/authSlice';
import type { AppDispatch, RootState } from './store/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Fuel from './pages/Fuel';
import Projects from './pages/Projects';
import TodayEntries from './pages/TodayEntries';
import UserManagement from './pages/UserManagement';
import { InteractionStatus } from '@azure/msal-browser';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const { user, status, error } = authState;

  useEffect(() => {
    const initAuth = async () => {
      if (inProgress === InteractionStatus.None) {
        const account = instance.getActiveAccount();
        
        if (isAuthenticated && account) {
          // User is authenticated with MSAL, get fresh token
          try {
            const response = await instance.acquireTokenSilent({
              ...loginRequest,
              account: account
            });
            // Only sync if we don't have a valid token or user data
            if (status === 'idle' || !user) {
              dispatch(syncUser(response.accessToken));
            }
          } catch (e) {
            console.error('Token acquisition failed:', e);
            // Clear stored data and redirect to login
            dispatch(logout());
            instance.loginRedirect(loginRequest);
          }
        } else if (!isAuthenticated && (user || authState.token)) {
          // We have stored credentials but not authenticated with MSAL
          // This means page was refreshed - try to authenticate silently
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            instance.setActiveAccount(accounts[0]);
            try {
              const response = await instance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0]
              });
              dispatch(syncUser(response.accessToken));
            } catch (e) {
              console.error('Silent token acquisition failed:', e);
              // Clear stored data and require login
              dispatch(logout());
            }
          } else {
            // No MSAL accounts, clear stored data
            dispatch(logout());
          }
        }
      }
    };
    
    initAuth();
  }, [isAuthenticated, inProgress, instance, dispatch, status, user, authState.token]);

  // Handle authentication failures (user not authorized)
  if (status === 'failed') {
    return (
      <div className="flex align-items-center justify-content-center h-screen surface-ground">
        <div className="p-4 shadow-2 border-round surface-card text-center" style={{ maxWidth: '500px' }}>
          <i className="pi pi-exclamation-triangle text-orange-500 mb-3" style={{ fontSize: '3rem' }}></i>
          <h1 className="mb-2">Access Denied</h1>
          <p className="mb-4 text-600">
            Your account is not authorized to access this system. 
            Please contact your administrator to request access.
          </p>
          {error && (
            <div className="mb-3 p-3 surface-100 border-round text-left">
              <p className="text-sm font-semibold mb-2">Error Details:</p>
              <p className="text-sm text-600" style={{ wordBreak: 'break-word' }}>{error}</p>
            </div>
          )}
          <Button 
            label="Logout" 
            icon="pi pi-sign-out" 
            onClick={() => {
              dispatch(logout());
              instance.logoutRedirect();
            }} 
            className="p-button-secondary" 
          />
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex align-items-center justify-content-center h-screen surface-ground">
        <div className="p-4 shadow-2 border-round surface-card text-center" style={{ maxWidth: '400px' }}>
          <i className="pi pi-car text-primary mb-3" style={{ fontSize: '3rem' }}></i>
          <h1 className="mb-2">Fuel Management System</h1>
          <p className="mb-4 text-600">Please sign in with your Microsoft account to continue</p>
          <Button label="Login with Microsoft" icon="pi pi-microsoft" onClick={handleLogin} className="p-button-lg" />
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex align-items-center justify-content-center h-screen surface-ground">
        <div className="text-center">
          <ProgressSpinner />
          <p className="mt-3 text-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/fuel" element={<Fuel />} />
        <Route path="/today" element={<TodayEntries />} />
        {user?.role === 'ADMIN' && (
          <>
            <Route path="/projects" element={<Projects />} />
            <Route path="/users" element={<UserManagement />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
