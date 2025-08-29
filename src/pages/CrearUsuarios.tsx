import React, { useEffect, useState } from "react";
import {
  Box, Button, Container, MenuItem, TextField, Typography, Alert, Paper,
  Menu
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const CrearUsuario = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [modulo, setModulo] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [modulos, setModulos] = useState<{ id: number; nombre: string }[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
  const fetchModulos = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/modulos`, config);
      setModulos(res.data); // res.data debe ser [{id, nombre}, ...]
    } catch (err) {
      console.error("Error al cargar módulos");
    }
  };
  fetchModulos();
}, []);

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/registro/registro`,
        {
          username,
          password,
          rol,
          modulo_id: rol !== "admin" ? modulo : null,
          is_admin: isAdmin
        },
        config
      );
      setMensaje({ tipo: "success", texto: "Usuario creado correctamente" });
      setUsername("");
      setPassword("");
      setRol("");
      setModulo("");
      setIsAdmin(false);
    } catch (err: any) {
      const detalle = err?.response?.data?.detail || "Error al crear usuario";
      setMensaje({ tipo: "error", texto: detalle });
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Crear Nuevo Usuario
        </Typography>

        {mensaje && <Alert severity={mensaje.tipo}>{mensaje.texto}</Alert>}

        <TextField
          label="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          select
          label="Rol"
          value={rol}
          onChange={(e) => {
            setRol(e.target.value);
            setIsAdmin(e.target.value === "admin");
          }}
          fullWidth
          margin="normal"
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="encargado">Encargado</MenuItem>
          <MenuItem value="asesor">Asesor</MenuItem>
          <MenuItem value="contador">Contador</MenuItem>
        </TextField>

        {rol !== "admin" && (
          <TextField
            select
            label="Módulo asignado"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
            fullWidth
            margin="normal"
          >
            {modulos.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
            Crear Usuario
          </Button>
        </Box>
        <Button 
  variant="outlined" 
  color="secondary" 
  sx={{ mt: 2, ml: 1 }}
  onClick={() => navigate("/usuarios/admin")}
>
  Ver usuarios
</Button>
      </Paper>
    </Container>
  );
};

export default CrearUsuario;
