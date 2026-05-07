import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, MenuItem, Menu
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { Link, useNavigate } from "react-router-dom";
import logo from "../ATO.jpeg";
import { obtenerRolDesdeToken } from "./Token";

const navBtnSx = {
  color: "#f1f5f9",
  fontWeight: 500,
  px: 1.5,
  "&:hover": {
    color: "#f97316",
    backgroundColor: "rgba(249,115,22,0.08)",
  },
  transition: "color 0.2s ease",
};

const Navbar = () => {
  const navigate = useNavigate();
  const rolToken = obtenerRolDesdeToken();

  const [usuario, setUsuario] = useState(localStorage.getItem("usuario") || "");
  const [modulo, setModulo] = useState(localStorage.getItem("modulo") || "");
  const [rolM, setRolM] = useState(localStorage.getItem("rol") || "");
  const [cadena, setCadena] = useState(sessionStorage.getItem("cadena_seleccionada") || "");

  const [anchorInventario, setAnchorInventario] = useState<null | HTMLElement>(null);
  const [anchorAdmin, setAnchorAdmin] = useState<null | HTMLElement>(null);
  const [anchorVentas, setAnchorVentas] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const actualizarDatos = () => {
      setUsuario(localStorage.getItem("usuario") || "");
      setModulo(localStorage.getItem("modulo") || "");
      setRolM(localStorage.getItem("rol") || "");
      setCadena(sessionStorage.getItem("cadena_seleccionada") || "");
    };
    window.addEventListener("storage", actualizarDatos);
    actualizarDatos();
    return () => window.removeEventListener("storage", actualizarDatos);
  }, []);

  const cerrarSesion = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/asistencias/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
  const closeMenu = (setFn: any) => setFn(null);

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 56 }}>

        {/* LEFT: Logo + user info */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          component={Link}
          to="/ventas"
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              px: 0.8,
              py: 0.3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img src={logo} alt="ATO" style={{ height: 28, display: "block" }} />
          </Box>
          {usuario && (
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", ml: 1.5, display: { xs: "none", sm: "block" } }}
            >
              {usuario} · {modulo}{cadena ? ` · ${cadena}` : ""} · {rolM}
            </Typography>
          )}
        </Box>

        {/* RIGHT: Navigation */}
        <Box display="flex" alignItems="center" gap={0.5}>

          {rolToken === "admin" && (
            <>
              <Button sx={navBtnSx} onClick={(e) => openMenu(e, setAnchorVentas)}>
                Ventas
              </Button>
              <Menu
                anchorEl={anchorVentas}
                open={Boolean(anchorVentas)}
                onClose={() => closeMenu(setAnchorVentas)}
              >
                <MenuItem component={Link} to="/ventas"><ConfirmationNumberIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />Ticket</MenuItem>
                <MenuItem component={Link} to="/ventas/chips">Chips</MenuItem>
                <MenuItem component={Link} to="/corte">Cortes</MenuItem>
              </Menu>

              <Button sx={navBtnSx} onClick={(e) => openMenu(e, setAnchorInventario)}>
                Inventario
              </Button>
              <Menu
                anchorEl={anchorInventario}
                open={Boolean(anchorInventario)}
                onClose={() => closeMenu(setAnchorInventario)}
              >
                <MenuItem component={Link} to="/inventario">Inventario</MenuItem>
                <MenuItem component={Link} to="/entrada-mercancia">Entrada de Mercancia</MenuItem>
                <MenuItem component={Link} to="/traspasos/admin">Traspasos</MenuItem>
                <MenuItem component={Link} to="/kardex">Kardex</MenuItem>
              </Menu>

              <Button sx={navBtnSx} onClick={(e) => openMenu(e, setAnchorAdmin)}>
                Administración
              </Button>
              <Menu
                anchorEl={anchorAdmin}
                open={Boolean(anchorAdmin)}
                onClose={() => closeMenu(setAnchorAdmin)}
              >
                <MenuItem component={Link} to="/usuarios">Usuarios</MenuItem>
                <MenuItem component={Link} to="/nomina">Nómina</MenuItem>
                <MenuItem component={Link} to="/comisiones">Comisiones</MenuItem>
                <MenuItem component={Link} to="/metricas">Métricas</MenuItem>
              </Menu>

              <Button sx={navBtnSx} component={Link} to="/telcel">
                TELCEL
              </Button>
              <Button sx={navBtnSx} component={Link} to="/clineas">
                C LÍNEAS
              </Button>
            </>
          )}

          {rolToken === "contador" && (
            <>
              <Button sx={navBtnSx} component={Link} to="/nomina">Nómina</Button>
              <Button sx={navBtnSx} component={Link} to="/corte">Cortes</Button>
              <Button sx={navBtnSx} component={Link} to="/comisiones">Comisiones</Button>
              <Button sx={navBtnSx} component={Link} to="/traspasos/admin">Traspasos</Button>
              <Button sx={navBtnSx} component={Link} to="/usuarios">Usuarios</Button>
              <Button sx={navBtnSx} component={Link} to="/inventario">Inventario</Button>
              <Button sx={navBtnSx} component={Link} to="/ventas/chips">Chips</Button>
            </>
          )}

          {rolToken === "encargado" && (
            <>
              <Button sx={navBtnSx} component={Link} to="/kardex">Kardex</Button>
              <Button sx={navBtnSx} component={Link} to="/nominaEmpleado">Nómina</Button>
              <Button sx={navBtnSx} component={Link} to="/traspasos">Traspasos</Button>
              <Button sx={navBtnSx} component={Link} to="/ventas" startIcon={<ConfirmationNumberIcon />}>Ticket</Button>
              <Button sx={navBtnSx} component={Link} to="/comisiones/usuario">Comisiones</Button>
              <Button sx={navBtnSx} component={Link} to="/inventario/modulo">Inventario</Button>
              <Button sx={navBtnSx} component={Link} to="/ventas/chips">Chips</Button>
            </>
          )}

          {rolToken === "asesor" && (
            <>
              <Button sx={navBtnSx} component={Link} to="/nominaEmpleado">Nómina</Button>
              <Button sx={navBtnSx} component={Link} to="/ventas" startIcon={<ConfirmationNumberIcon />}>Ticket</Button>
              <Button sx={navBtnSx} component={Link} to="/comisiones/usuario">Comisiones</Button>
              <Button sx={navBtnSx} component={Link} to="/ventas/chips">Chips</Button>
            </>
          )}

          {rolToken === "direccion" && (
            <Button sx={{ ...navBtnSx, color: "#f97316", fontWeight: 700 }} component={Link} to="/direccion">
              Cortes
            </Button>
          )}

          <Button
            sx={{
              ...navBtnSx,
              ml: 1,
              border: "1px solid rgba(249,115,22,0.35)",
              borderRadius: 1,
              "&:hover": {
                color: "#ffffff",
                backgroundColor: "#f97316",
                border: "1px solid #f97316",
              },
            }}
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
