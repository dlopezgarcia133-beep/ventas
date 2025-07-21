import React, { useEffect, useState } from "react";
import {
  Container, Typography, TextField, IconButton, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Button
} from "@mui/material";
import { Edit, Save, Delete } from "@mui/icons-material";
import axios from "axios";
import { Usuario } from "../Types"; // Asegúrate de definir esta interfaz

const roles = ["admin", "encargado", "asesor"];

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<Partial<Usuario> & { password?: string; modulo_id?: number }>({});
  const [modulos, setModulos] = useState<{ id: number, nombre: string }[]>([]);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const cargarModulos = async () => {
  try {
    const res = await axios.get("${process.env.REACT_APP_API_URL}/registro/modulos", config);
    setModulos(res.data);
  } catch (error) {
    console.error("Error al cargar módulos", error);
  }
};

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get("${process.env.REACT_APP_API_URL}/registro/usuarios", config);
      setUsuarios(res.data);
    } catch (err) {
      alert("Error al cargar usuarios");
    }
  };

  const editarUsuario = (usuario: Usuario) => {
  setEditandoId(usuario.id);
  setFormulario({ ...usuario });
};


const guardarCambios = async (id: number) => {
  try {
    const datos: any = { ...formulario };
    if (!datos.password) delete datos.password;
    if (!datos.username) delete datos.username;
    if (!datos.rol) delete datos.rol;
    if (datos.modulo_id === "" || isNaN(Number(datos.modulo_id))) delete datos.modulo_id;
    if (typeof datos.is_admin === "undefined") delete datos.is_admin;
     delete datos.modulo;
     delete datos.id;
    console.log("Enviando datos:", datos); // <-- AGREGA ESTO

    await axios.put(`${process.env.REACT_APP_API_URL}/registro/usuarios/${id}`, datos, config);
    setEditandoId(null);
    setFormulario({});
    cargarUsuarios();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al editar usuario");
  }
};

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/registro/usuarios/${id}`, config);
      cargarUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al eliminar usuario");
    }
  };

  useEffect(() => {
    cargarUsuarios();
     cargarModulos();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Contraseña</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  {editandoId === u.id ? (
                    <TextField
                      value={formulario.username || ""}
                      onChange={(e) => setFormulario({ ...formulario, username: e.target.value })}
                      size="small"
                    />
                  ) : u.username}
                </TableCell>
                <TableCell>
                  {editandoId === u.id ? (
                    <TextField
                      select
                      value={formulario.rol || ""}
                      onChange={(e) => setFormulario({ ...formulario, rol: e.target.value as Usuario["rol"] })}
                      size="small"
                    >
                      {roles.map((rol) => (
                        <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                      ))}
                    </TextField>
                  ) : u.rol}
                </TableCell>
                <TableCell>
                  {editandoId === u.id ? (
                    <TextField
                      select
                      value={formulario.modulo_id ?? ""}
                      onChange={(e) =>
                        setFormulario({ ...formulario, modulo_id: parseInt(e.target.value) })
                      }
                      size="small"
                    >
                      {modulos.map((modulo) => (
                        <MenuItem key={modulo.id} value={modulo.id}>
                          {modulo.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    u.modulo?.nombre || "-"
                  )}
                </TableCell>
                <TableCell>
                  {editandoId === u.id ? (
                    <TextField
                      select
                      value={formulario.is_admin ? "true" : "false"}
                      onChange={(e) => setFormulario({ ...formulario, is_admin: e.target.value === "true" })}
                      size="small"
                    >
                      <MenuItem value="true">Sí</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </TextField>
                  ) : u.is_admin ? "Sí" : "No"}
                </TableCell>
                <TableCell>
                  {editandoId === u.id ? (
                    <TextField
                      value={formulario.password || ""}
                      onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                      size="small"
                      type="password"
                      placeholder="Nueva contraseña"
                    />
                  ) : (
                    "••••••••"
                  )}
                </TableCell>
                <TableCell>
                  {editandoId === u.id ? (
                    <IconButton color="primary" onClick={() => guardarCambios(u.id)}>
                      <Save />
                    </IconButton>
                  ) : (
                    <IconButton color="info" onClick={() => editarUsuario(u)}>
                      <Edit />
                    </IconButton>
                  )}
                  <IconButton color="error" onClick={() => eliminarUsuario(u.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay usuarios</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UsuariosAdmin;
