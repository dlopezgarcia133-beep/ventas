import React, { useEffect, useState } from "react";
import {
  TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody,Checkbox,Typography,Box,
  Button,
  Link,
  TablePagination,
} from "@mui/material";
import axios from "axios";
import { Usuario, VentaChip } from "../Types";
import { obtenerRolDesdeToken } from "../components/Token";
import DeleteIcon from "@mui/icons-material/Delete";


const ChipsAdmin = () => {
  const [chips, setChips] = useState<VentaChip[]>([]);
  const token = localStorage.getItem("token");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);
  const rol = obtenerRolDesdeToken();
  const [paginaAdmin, setPaginaAdmin] = useState(0);
  const [paginaUser, setPaginaUser] = useState(0);
  const filasPorPagina = 10;


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

const eliminarChip = async (id: number) => {
  const confirmar = window.confirm("¿Seguro que quieres eliminar este chip?");
  if (!confirmar) return;

  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/ventas/eliminar_chip/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setChips((prev) => prev.filter((chip) => chip.id !== id));
  } catch (error) {
    console.error("Error al eliminar chip:", error);
    alert("No se pudo eliminar el chip");
  }
};



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
            <Button href="/chips_invalidos">Incubadora</Button>

            <Button  style={{ marginLeft: "1rem" }}  href = "/promos">Promociones Clientes</Button>
            </Box>
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
                    <TableCell>Descripcion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chips.filter(chip => !chip.validado && !chip.descripcion_rechazo)
                    .slice(paginaAdmin * filasPorPagina, paginaAdmin * filasPorPagina + filasPorPagina)
                    .map((chip) => (
                    <TableRow key={chip.id}>
  <TableCell>{chip.empleado?.username ?? "Empleado eliminado"}</TableCell>
  <TableCell>{chip.tipo_chip}</TableCell>
  <TableCell>{chip.numero_telefono}</TableCell>
  <TableCell>${chip.monto_recarga.toFixed(2)}</TableCell>
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
      <option value="Activacion sin llamada">Activacion sin llamada</option>
      <option value="No es su clasificacion">No es su clasificacion</option>
      <option value="Esta Preactivado">Esta Preactivado</option>
      <option value="No tiene recarga">No tiene recarga</option>
      <option value="Linea esta duplicada">Linea esta duplicada</option>
      <option value="No esta en el ciclo">No esta en el ciclo</option>
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
            <TablePagination
              component="div"
              count={chips.filter(chip => !chip.validado && !chip.descripcion_rechazo).length}
              page={paginaAdmin}
              onPageChange={(_, p) => setPaginaAdmin(p)}
              rowsPerPage={filasPorPagina}
              rowsPerPageOptions={[filasPorPagina]}
            />
          </>
        )}

      <>
        <Box sx={{ mt: 4 }} />
        {(rol === "encargado" || rol === "asesor") && (
          <>
            <Typography variant="h5" gutterBottom>
              Validación de Chips Vendidos
            </Typography>
            <Button href="/chips_invalidos">Incubadora</Button>
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
                    <TableCell>Eliminar</TableCell>
                    
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chips.filter(chip => !chip.validado)
                    .slice(paginaUser * filasPorPagina, paginaUser * filasPorPagina + filasPorPagina)
                    .map((chip) => (
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
                      <TableCell>
                        {!chip.validado && (
                          <Button
                            color="error"
                            onClick={() => eliminarChip(chip.id)}
                          >
                            <DeleteIcon />
                          </Button>
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
            <TablePagination
              component="div"
              count={chips.filter(chip => !chip.validado).length}
              page={paginaUser}
              onPageChange={(_, p) => setPaginaUser(p)}
              rowsPerPage={filasPorPagina}
              rowsPerPageOptions={[filasPorPagina]}
            />
          </>
        )}
      </>


      </>
    </Box>
  );
};

export default ChipsAdmin;
