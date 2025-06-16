import React from 'react';
import { useRoutes } from 'react-router-dom';
import LoginPage from './pages/LoginPages';
import Dashboard from './pages/DashboardPage';
import VentasPage from './pages/VentasPage';

const App: React.FC = () => {
  const routes = useRoutes([
    { path: '/', element: <LoginPage /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/ventas', element: <VentasPage /> } 
  ]);

  return routes;
};

export default App;