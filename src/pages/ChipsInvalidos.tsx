import React, { useEffect, useState } from "react";
import axios from "axios";
import { Usuario, VentaChip } from "../Types";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Checkbox, Box } from "@mui/material";

const ChipsRechazados = () => {
  const [rechazados, setRechazados] = useState<VentaChip[]>([]);
  const [chips, setChips] = useState<VentaChip[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  const fetchRechazados = async () => {
    try {
      const params: any = {};
      if (empleadoSeleccionado) {
        params.empleado_id = empleadoSeleccionado;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/ventas/ventas/chips_rechazados`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params, 
        }
      );

      setRechazados(res.data);
    } catch (err) {
      console.error("Error al obtener chips rechazados:", err);
    }
  };

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/registro/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(res.data);
      } catch (err) {
        console.warn("No se pudo cargar usuarios (probablemente no eres admin)");
      }
    };
  
    cargarUsuarios();
  }, []);

  const revertirRechazo = async (id: number) => {
  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/ventas/revertir_rechazo/${id}`);
    setRechazados(prev => prev.filter(c => c.id !== id)); 
  } catch (error) {
    console.error("Error al revertir rechazo", error);
  }
};

  useEffect(() => {
    fetchRechazados();
  }, [empleadoSeleccionado]);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Chips Invalidos</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Filtrar por empleado:</Typography>
        <select
          value={empleadoSeleccionado ?? ""}
          onChange={(e) =>
            setEmpleadoSeleccionado(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">(Todos los empleados)</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Empleado</TableCell>
            <TableCell>Número</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Motivo de Rechazo</TableCell>
            <TableCell>Validar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rechazados.map((chip) => (
            <TableRow key={chip.id}>
              <TableCell>{chip.empleado?.username ?? "Empleado eliminado"}</TableCell>
              <TableCell>{chip.numero_telefono}</TableCell>
              <TableCell>{chip.fecha}</TableCell>
              <TableCell>{chip.descripcion_rechazo}</TableCell>
              <TableCell>
                  <Checkbox
                    checked={false} // siempre desmarcado porque no es validación
                    onChange={() => revertirRechazo(chip.id)}
                    color="success"
                  />
                
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChipsRechazados;
