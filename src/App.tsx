import React from 'react';
import { useRoutes } from 'react-router-dom';
import LoginPage from './pages/LoginPages';
import VentasPage from './pages/VentasPage';
import ComisionesPage from './pages/ComisionesPage';
import TraspasosPage from './pages/TraspasosPage';
import TraspasosAdmin from './pages/TraspasosAdmin';
import CrearUsuario from './pages/CrearUsuarios';
import UsuariosAdmin from './pages/Usuarios';
import InventarioAdmin from './pages/Inventario';
import InventarioPorModulo from './pages/InventarioModulo';
import ChipsAdmin from './pages/ChipsAdmin';
import CortePage from './pages/CortePage';
import InventarioTelefonosGeneral from './pages/InventariosTelefonos';
import ComisionesUser from './pages/ComisionesUser';
import ChipsRechazados from './pages/ChipsInvalidos';
import DiferenciasInventario from './pages/InventarioDiferencias';

const App: React.FC = () => {
  const routes = useRoutes([
    { path: '/', element: <LoginPage /> },
    { path: '/ventas', element: <VentasPage /> },
    { path: '/comisiones', element: <ComisionesPage />},
    { path: '/comisiones/usuario', element: <ComisionesUser /> },
    { path: '/traspasos', element: <TraspasosPage /> },
    { path: '/traspasos/admin', element: <TraspasosAdmin /> },
    { path: '/usuarios', element: <CrearUsuario /> },
    { path: '/usuarios/admin', element: <UsuariosAdmin/>},
    { path: '/inventario', element: <InventarioAdmin /> },
    { path: '/inventario/modulo', element: <InventarioPorModulo /> },
    { path: '/ventas/chips', element: <ChipsAdmin/>}, 
    { path: '/corte', element: <CortePage/>},
    { path: '/inventario_telefonos', element: <InventarioTelefonosGeneral/> },
    { path: '/chips_invalidos', element: <ChipsRechazados/> }, 
    { path: '/inventario/diferencias', element: <DiferenciasInventario /> }, 
  ]);

  return routes;
};

export default App;