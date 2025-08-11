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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/ventas/chips_rechazados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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


  const validarChip = async (id: number, tipo_chip: string, comision?: number) => {
    if (tipo_chip === "Activacion" && (comision === undefined || comision === null)) {
      alert("Por favor ingresa una comisión para chips de tipo Activación.");
      return;
    }
  
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/ventas/venta_chips/${id}/validar`,
        { comision_manual: comision }, // siempre la mandas aunque sea null
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChips((prev) =>
        prev.map((chip) =>
          chip.id === id ? { ...chip, validado: true } : chip
        )
      );
    } catch (error) {
      console.error("Error al validar chip:", error);
      alert("Error al validar chip");
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
                  {chip.tipo_chip === "Activacion" && !chip.validado ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <input
                    type="number"
                    placeholder="Comisión"
                    value={chip.comision || ""}
                    onChange={(e) =>
                      setChips((prev) =>
                        prev.map((c) =>
                          c.id === chip.id
                            ? { ...c, comision: parseFloat(e.target.value) }
                            : c
                        )
                      )
                    }
                    style={{ width: "80px" }}
                  />
                  <button
                    onClick={() => validarChip(chip.id, chip.tipo_chip, chip.comision_manual)}
                    disabled={!chip.comision}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Validar
                  </button>
                </div>
              ) : chip.validado ? (
                <Typography color="green">${chip.comision}</Typography>
              ) : (
                <Checkbox
                  checked={chip.validado}
                  onChange={() => validarChip(chip.id, chip.tipo_chip, chip.comision_manual)}
                  disabled={chip.validado}
                  color="success"
                />
              )}
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChipsRechazados;
