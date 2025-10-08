import React, { useEffect, useState } from "react";
import {
  TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody,Checkbox,Typography,Box,
  Button,
  Link,
} from "@mui/material";
import axios from "axios";
import { Usuario, VentaChip } from "../Types";
import { obtenerRolDesdeToken } from "../components/Token";


const ChipsAdmin = () => {
  const [chips, setChips] = useState<VentaChip[]>([]);
  const token = localStorage.getItem("token");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);
  const rol = obtenerRolDesdeToken();


  const fetchChips = async () => {
  try {
    const params: any = {};
    if (empleadoSeleccionado) {
      params.empleado_id = empleadoSeleccionado;
    }

    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/venta_chips`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    const sinValidados = res.data.filter((chip: VentaChip) => !chip.validado);

    sinValidados.sort((a: VentaChip, b: VentaChip) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaB.getTime() - fechaA.getTime(); // descendente
    });
    setChips(sinValidados);
  } catch (error) {
    console.error("Error al cargar chips:", error);
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
  if (
    tipo_chip === "Activacion" && 
    (comision === undefined || comision === null || isNaN(Number(comision)) || Number(comision) <= 0)
  ) {
    alert("Por favor ingresa una comisión válida para chips de tipo Activación.");
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
  fetchChips();
}, [empleadoSeleccionado]);

  return (
    <Box sx={{ mt: 4 }}>
      <>
        {rol === "admin" && (
          <>
            <Typography variant="h5" gutterBottom>
              Validación de Chips Vendidos
            </Typography>
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
            <Box sx={{ mb: 2 }}>
            <Button href="/chips_invalidos">Ver Chips Invalidos</Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell>Tipo de Chip</TableCell>
                    <TableCell>Número</TableCell>
                    <TableCell>Recarga</TableCell>
                    <TableCell>Clave</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Validado</TableCell>
                    <TableCell>Descripcion</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chips.filter(chip => !chip.validado && !chip.descripcion_rechazo).map((chip) => (
                    <TableRow key={chip.id}>
  <TableCell>{chip.empleado?.username ?? "Empleado eliminado"}</TableCell>
  <TableCell>{chip.tipo_chip}</TableCell>
  <TableCell>{chip.numero_telefono}</TableCell>
  <TableCell>${chip.monto_recarga.toFixed(2)}</TableCell>
  <TableCell>{chip.clave_b63 || 'N/A'}</TableCell>
  <TableCell>{chip.fecha}</TableCell>
  <TableCell>{chip.hora}</TableCell>
  

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
      onClick={() => validarChip(chip.id, chip.tipo_chip, chip.comision)}
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
  <TableCell>
  {chip.validado ? (
    <Typography color="green">${chip.comision}</Typography>
  ) : (
    <select
      value={chip.descripcion_rechazo || ''}
      onChange={async (e) => {
        const motivo = e.target.value;
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/ventas/venta_chips/${chip.id}/motivo_rechazo`,
            { descripcion: motivo },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setChips((prev) =>
            prev.map((c) =>
              c.id === chip.id ? { ...c, descripcion_rechazo: motivo } : c
            )
          );
        } catch (err) {
          console.error("Error al enviar motivo de rechazo:", err);
          alert("Error al enviar motivo de rechazo");
        }
      }}
    >
      <option value="">Rechazar con motivo</option>
      <option value="No tiene llamada">No tiene llamada</option>
      <option value="No tiene Recarga">No tiene Recarga</option>
      <option value="Duplicado">Duplicado</option>
      <option value="No existe">No existe</option>
    </select>
  )}
</TableCell>
</TableRow>
                  ))}
                  {chips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay chips registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

      <>
        <Box sx={{ mt: 4 }} />
        {(rol === "encargado" || rol === "asesor") && (
          <>
            <Typography variant="h5" gutterBottom>
              Validación de Chips Vendidos
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell>Tipo de Chip</TableCell>
                    <TableCell>Número</TableCell>
                    <TableCell>Recarga</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Detalles</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chips.filter(chip => !chip.validado).map((chip) => (
                    <TableRow key={chip.id}>
                      <TableCell>{chip.empleado && chip.empleado.username? chip.empleado.username: "Empleado eliminado"}</TableCell>
                      <TableCell>{chip.tipo_chip}</TableCell>
                      <TableCell>{chip.numero_telefono}</TableCell>
                      <TableCell>${chip.monto_recarga.toFixed(2)}</TableCell>
                      <TableCell>{chip.fecha}</TableCell>
                      <TableCell>{chip.hora}</TableCell>
                      <TableCell>
                        {chip.validado ? (
                          chip.comision ? `$${chip.comision}` : "Sin comisión"
                        ) : chip.descripcion_rechazo ?? "Pendiente"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {chips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay chips registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </>
        

      </>
    </Box>
  );
};

export default ChipsAdmin;
