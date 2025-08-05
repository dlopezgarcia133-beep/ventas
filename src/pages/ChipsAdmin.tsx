import React, { useEffect, useState } from "react";
import {
  TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody,Checkbox,Typography,Box,
} from "@mui/material";
import axios from "axios";
import { VentaChip } from "../Types";
import { obtenerRolDesdeToken } from "../components/Token";


const ChipsAdmin = () => {
  const [chips, setChips] = useState<VentaChip[]>([]);
  const token = localStorage.getItem("token");

  const rol = obtenerRolDesdeToken();


  const fetchChips = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ventas/venta_chips`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const sinValidados = res.data.filter((chip: VentaChip) => !chip.validado);
    setChips(sinValidados);
  } catch (error) {
    console.error("Error al cargar chips:", error);
  }
};


  const validarChip = async (id: number, comision?: number) => {
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/ventas/venta_chips/${id}/validar`,
      { comision_manual: comision },
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
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <>
        {rol === "admin" && (
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
                    <TableCell>Validado</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chips.filter(chip => !chip.validado).map((chip) => (
                    <TableRow key={chip.id}>
  <TableCell>{chip.empleado?.username ?? "Empleado eliminado"}</TableCell>
  <TableCell>{chip.tipo_chip}</TableCell>
  <TableCell>{chip.numero_telefono}</TableCell>
  <TableCell>${chip.monto_recarga.toFixed(2)}</TableCell>
  <TableCell>{chip.fecha}</TableCell>
  <TableCell>{chip.hora}</TableCell>
  <TableCell>
    {chip.tipo_chip === "Activacion" && !chip.validado ? (
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
    ) : chip.validado ? (
      <Typography color="green">${chip.comision}</Typography>
    ) : (
      "-"
    )}
  </TableCell>
  <TableCell>
    <Checkbox
      checked={chip.validado}
      onChange={() => validarChip(chip.id, chip.comision)}
      disabled={chip.validado}
      color="success"
    />
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
