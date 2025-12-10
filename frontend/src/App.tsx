import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from './authConfig';
import { syncUser } from './store/slices/authSlice';
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
  const { user, status } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && inProgress === InteractionStatus.None && status === 'idle') {
      const account = instance.getActiveAccount();
      if (account) {
        instance.acquireTokenSilent({
          ...loginRequest,
          account: account
        }).then((response) => {
          dispatch(syncUser(response.accessToken));
        }).catch((e) => {
          console.error('Token acquisition failed:', e);
          instance.loginRedirect(loginRequest);
        });
      }
    }
  }, [isAuthenticated, inProgress, instance, dispatch, status]);

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
