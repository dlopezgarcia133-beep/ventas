import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { obtenerRolDesdeToken } from "./Token";


const Navbar = () => {
  const navigate = useNavigate();
  const rol = obtenerRolDesdeToken();

  const cerrarSesion = async () => {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error al registrar salida:", error);
  } finally {
    localStorage.removeItem("token");
    navigate("/");
  }
};


  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex",  justifyContent: "space-between" }}>
        <Typography variant="h6" color="inherit" component={Link} to="/ventas" sx={{ textDecoration: "none" }}>
          ATO
        </Typography>

        <Box sx={{ paddingTop: "64px" }}>
          {rol === "admin" && (
            <>
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

          {rol === "encargado" && (
            <>
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

          {rol === "asesor" && (
            <>
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
