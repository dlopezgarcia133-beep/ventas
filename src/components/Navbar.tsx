import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box, MenuItem, Menu } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { obtenerRolDesdeToken } from "./Token";

const Navbar = () => {
  const navigate = useNavigate();
  const rolToken = obtenerRolDesdeToken();

  const [usuario, setUsuario] = useState(localStorage.getItem("usuario") || "");
  const [modulo, setModulo] = useState(localStorage.getItem("modulo") || "");
  const [rolM, setRolM] = useState(localStorage.getItem("rol") || "");

  const [anchorInventario, setAnchorInventario] = useState<null | HTMLElement>(null);
  const [anchorAdmin, setAnchorAdmin] = useState<null | HTMLElement>(null);
  const [anchorVentas, setAnchorVentas] = useState<null | HTMLElement>(null);

  // 🔹 Actualizar datos cuando cambie localStorage (después del login)
  useEffect(() => {
    const actualizarDatos = () => {
      setUsuario(localStorage.getItem("usuario") || "");
      setModulo(localStorage.getItem("modulo") || "");
      setRolM(localStorage.getItem("rol") || "");
    };

    window.addEventListener("storage", actualizarDatos);
    actualizarDatos();

    return () => {
      window.removeEventListener("storage", actualizarDatos);
    };
  }, []);

  const cerrarSesion = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/asistencias/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error al registrar salida:", error);
    } finally {
      localStorage.clear();
      setUsuario("");
      setModulo("");
      setRolM("");
      navigate("/");
    }
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>, setFn: any) => {
    setFn(event.currentTarget);
  };

  const closeMenu = (setFn: any) => {
    setFn(null);
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          color="inherit"
          component={Link}
          to="/ventas"
          sx={{ textDecoration: "none" }}
        >
          ATO
          <Typography
            variant="body2"
            component="span"
            sx={{ fontSize: "1.5rem", color: "#fffefeff", marginLeft: "40px" }}
          >
            {usuario}, {modulo}, {rolM}
          </Typography>
        </Typography>

        <Box>
          {rolToken === "admin" && (
            <>
              <Button
                color="inherit"
                onClick={(e) => openMenu(e, setAnchorVentas)}
              >
                Ventas
              </Button>

              <Menu
                anchorEl={anchorVentas}
                open={Boolean(anchorVentas)}
                onClose={() => closeMenu(setAnchorVentas)}
              >
                <MenuItem component={Link} to="/ventas">Ventas</MenuItem>
                <MenuItem component={Link} to="/ventas/chips">Chips</MenuItem>
                <MenuItem component={Link} to="/corte">Cortes</MenuItem>
              </Menu>

              <Button
                color="inherit"
                onClick={(e) => openMenu(e, setAnchorInventario)}
              >
                Inventario
              </Button>

              <Menu
                anchorEl={anchorInventario}
                open={Boolean(anchorInventario)}
                onClose={() => closeMenu(setAnchorInventario)}
              >
                <MenuItem component={Link} to="/inventario">
                  Inventario
                </MenuItem>

                <MenuItem component={Link} to="/traspasos/admin">
                  Traspasos
                </MenuItem>

                <MenuItem component={Link} to="/kardex">
                  Kardex
                </MenuItem>
              </Menu>

              <Button
                color="inherit"
                onClick={(e) => openMenu(e, setAnchorAdmin)}
              >
                Administración
              </Button>

              <Menu
                anchorEl={anchorAdmin}
                open={Boolean(anchorAdmin)}
                onClose={() => closeMenu(setAnchorAdmin)}
              >
                <MenuItem component={Link} to="/usuarios">
                  Usuarios
                </MenuItem>

                <MenuItem component={Link} to="/nomina">
                  Nómina
                </MenuItem>

                <MenuItem component={Link} to="/comisiones">
                  Comisiones
                </MenuItem>
              </Menu>

            </>
          )}

          {rolToken === "contador" && (
            <>
            <Button color="inherit" component={Link} to="/nomina">
                Nomina
              </Button>
            <Button color="inherit" component={Link} to="/corte">
                Cortes
              </Button>
              <Button color="inherit" component={Link} to="/comisiones">
                Comisiones
              </Button>
              <Button color="inherit" component={Link} to="/traspasos/admin">
                Traspasos
              </Button>
              <Button color="inherit" component={Link} to="/usuarios">
                Usuarios
              </Button>
              <Button color="inherit" component={Link} to="/inventario">
                Inventario
              </Button>
              <Button color="inherit" component={Link} to="/ventas/chips">
                Chips
              </Button>
              
            </>
          )}

          {rolToken === "encargado" && (
            <>
              <Button color="inherit" component={Link} to="/kardex">
                Kardex
              </Button>
             <Button color="inherit" component={Link} to="/nominaEmpleado">
                Nomina
              </Button> 
              <Button color="inherit" component={Link} to="/traspasos">
                Traspasos
              </Button>
              <Button color="inherit" component={Link} to="/ventas">
                Ventas
              </Button>
              <Button color="inherit" component={Link} to="/comisiones/usuario">
                Comisiones
              </Button>
              <Button color="inherit" component={Link} to="/inventario/modulo">
                Inventario
              </Button>
              <Button color="inherit" component={Link} to="/ventas/chips">
                Chips
              </Button>
            </>
          )}

          {rolToken === "asesor" && (
            <>
             <Button color="inherit" component={Link} to="/nominaEmpleado">
                Nomina
              </Button> 
              <Button color="inherit" component={Link} to="/ventas">
                Ventas
              </Button>
              <Button color="inherit" component={Link} to="/comisiones/usuario">
                Comisiones
              </Button>
              <Button color="inherit" component={Link} to="/ventas/chips">
                Chips
              </Button>
            </>
          )}

          <Button color="inherit" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
