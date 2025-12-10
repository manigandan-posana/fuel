import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from './authConfig';
import { syncUser } from './store/slices/authSlice';
import { AppDispatch, RootState } from './store/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Fuel from './pages/Fuel';
import Projects from './pages/Projects';
import { InteractionStatus } from '@azure/msal-browser';
import { Button } from 'primereact/button';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (isAuthenticated && inProgress === InteractionStatus.None) {
      const account = instance.getActiveAccount();
      if (account) {
        instance.acquireTokenSilent({
          ...loginRequest,
          account: account
        }).then((response) => {
          dispatch(syncUser(response.accessToken));
        }).catch((e) => {
          console.error(e);
        });
      }
    }
  }, [isAuthenticated, inProgress, instance, dispatch]);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex align-items-center justify-content-center h-screen surface-ground">
        <div className="p-4 shadow-2 border-round surface-card text-center">
          <h1 className="mb-4">Fuel Management</h1>
          <Button label="Login with Microsoft" icon="pi pi-microsoft" onClick={handleLogin} />
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
        {user?.role === 'ADMIN' && <Route path="/projects" element={<Projects />} />}
      </Routes>
    </Layout>
  );
}

export default App;
