import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { obtenerRolDesdeToken } from "./Token";

const Navbar = () => {
  const navigate = useNavigate();
  const rolToken = obtenerRolDesdeToken();

  const [usuario, setUsuario] = useState(localStorage.getItem("usuario") || "");
  const [modulo, setModulo] = useState(localStorage.getItem("modulo") || "");
  const [rolM, setRolM] = useState(localStorage.getItem("rol") || "");

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

          {rolToken === "contador" && (
            <>
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
