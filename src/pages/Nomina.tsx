import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { NominaEmpleado, NominaPeriodo } from "../Types";

const Nomina = () => {
  const token = localStorage.getItem("token");

  // ⚠️ luego puedes obtenerlo del token
  const esAdmin = true;

  const [periodo, setPeriodo] = useState<NominaPeriodo | null>(null);
  const [nomina, setNomina] = useState<NominaEmpleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [edicion, setEdicion] = useState<Record<number, {
  sueldo_base: number
  horas_extra: number }>>({});

  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number | null>(null);
  const [resumenEmpleado, setResumenEmpleado] = useState<any>(null);

  // 🔹 Derivados
  const asesores = nomina.filter(e => e.usuario.startsWith("A"));
  const encargados = nomina.filter(e => e.usuario.startsWith("C"));


  // =========================
  // 🔹 API CALLS
  // =========================

  const fetchPeriodoActivo = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/periodo/activo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPeriodo(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setPeriodo(null);
        setNomina([]);
      } else {
        console.error("Error al obtener periodo activo:", err);
      }
    }
  };

  const fetchResumenNomina = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/resumen`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNomina(res.data);
    } catch (err) {
      console.error("Error al obtener resumen de nómina:", err);
      setNomina([]);
    } finally {
      setLoading(false);
    }
  };



  const fetchResumenEmpleado = async (usuarioId: number) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/nomina/resumen/empleado/${usuarioId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setResumenEmpleado(res.data);
  } catch (err) {
    console.error("Error al obtener resumen del empleado", err);
    setResumenEmpleado(null);
  }
};


  const activarPeriodoNomina = async (inicio: Dayjs, fin: Dayjs) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/nomina/periodo/activar`,
        {
          fecha_inicio: inicio.format("YYYY-MM-DD"),
          fecha_fin: fin.format("YYYY-MM-DD"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPeriodo(res.data);
      fetchResumenNomina();
    } catch (err) {
      console.error("Error al activar periodo de nómina:", err);
    }
  };

  const actualizarNominaEmpleado = async (
    usuarioId: number,
    sueldoBase: number,
    horasExtra: number
  ) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/nomina/empleado/${usuarioId}`,
        {
          sueldo_base: sueldoBase,
          horas_extra: horasExtra,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchResumenNomina();
    } catch (err) {
      console.error("Error al actualizar nómina del empleado:", err);
    }
  };

  const cerrarNomina = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/nomina/cerrar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPeriodo(null);
      setNomina([]);
    } catch (err) {
      console.error("Error al cerrar nómina:", err);
    }
  };

  const descargarNominaExcel = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/descargar`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "nomina.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error al descargar nómina:", err);
    }
  };

  // =========================
  // 🔹 EFFECTS
  // =========================

  useEffect(() => {
    fetchPeriodoActivo();
  }, []);

  useEffect(() => {
    if (periodo) {
      fetchResumenNomina();
    }
  }, [periodo]);



  useEffect(() => {
  const base: any = {};
  nomina.forEach(e => {
    base[e.usuario_id] = {
      sueldo_base: e.sueldo_base,
      horas_extra: e.horas_extra
    };
  });
  setEdicion(base);
}, [nomina]);

  // =========================
  // 🔹 UI
  // =========================

  


  const renderTabla = (titulo: string, data: NominaEmpleado[]) => (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>
        {titulo}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Empleado</TableCell>
            <TableCell align="right">Comisiones</TableCell>
            <TableCell align="right">Sueldo base</TableCell>
            <TableCell align="right">Horas extra</TableCell>
            <TableCell align="right">Pago horas</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((e) => (
            <TableRow key={e.usuario_id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setEmpleadoSeleccionado(e.usuario_id);
                fetchResumenEmpleado(e.usuario_id);
              }}>
              <TableCell>{e.nombre}</TableCell>
              <TableCell align="right">${e.comisiones}</TableCell>

              <TableCell align="right">
                {esAdmin ? (
                  <TextField
                    size="small"
                    type="number"
                    value={edicion[e.usuario_id]?.sueldo_base ?? 0}
                    onChange={(ev) =>
                      setEdicion(prev => ({
                        ...prev,
                        [e.usuario_id]: {
                          ...prev[e.usuario_id],
                          sueldo_base: Number(ev.target.value)
                        }
                      }))
                    }
                  />

                ) : (
                  `$${e.sueldo_base}`
                )}
              </TableCell>

              <TableCell align="right">
                {esAdmin ? (
                  <TextField
                    size="small"
                    type="number"
                    value={edicion[e.usuario_id]?.horas_extra ?? 0}
                    onChange={(ev) =>
                      setEdicion(prev => ({
                        ...prev,
                        [e.usuario_id]: {
                          ...prev[e.usuario_id],
                          horas_extra: Number(ev.target.value)
                        }
                      }))
                    }
                  />

                ) : (
                  e.horas_extra
                )}
              </TableCell>

              <TableCell align="right">${e.pago_horas_extra}</TableCell>
              <TableCell align="right">
                <strong>${e.total_pagar}</strong>
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    actualizarNominaEmpleado(
                      e.usuario_id,
                      edicion[e.usuario_id].sueldo_base,
                      edicion[e.usuario_id].horas_extra
                    )
                  }
                >
                  Guardar
                </Button>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  return (
  <Box p={3} display="flex" gap={3}>
    {/* =========================
        PANEL IZQUIERDO
    ========================= */}
    <Box width={320}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          Detalle del empleado
        </Typography>

        {!empleadoSeleccionado && (
          <Typography color="text.secondary" mt={1}>
            Selecciona un empleado
          </Typography>
        )}

        {resumenEmpleado && (
          <>
            <Typography mt={2}>🎧 Accesorios: ${resumenEmpleado.accesorios}</Typography>
            <Typography>📱 Teléfonos: ${resumenEmpleado.telefonos}</Typography>
            <Typography>💳 Chips: ${resumenEmpleado.chips}</Typography>

            <Typography mt={2} fontWeight="bold">
              Total comisiones: ${resumenEmpleado.total_comisiones}
            </Typography>
          </>
        )}
      </Paper>
    </Box>

    {/* =========================
        CONTENIDO PRINCIPAL
    ========================= */}
    <Box flex={1}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Nómina</Typography>

        {esAdmin && !periodo && (
          <TextField
            type="date"
            label="Inicio del periodo"
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              activarPeriodoNomina(
                dayjs(e.target.value),
                dayjs(e.target.value).add(6, "day")
              )
            }
          />
        )}
      </Box>

      {!periodo && (
        <Typography color="text.secondary">
          El administrador aún no ha definido el periodo de nómina
        </Typography>
      )}

      {periodo && !loading && (
        <>
          {renderTabla("Asesores (A)", asesores)}
          {renderTabla("Encargados (C)", encargados)}

          {esAdmin && (
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="error"
                onClick={cerrarNomina}
              >
                Cerrar nómina
              </Button>

              <Button
                variant="outlined"
                onClick={descargarNominaExcel}
              >
                Descargar Excel
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  </Box>
);
};

export default Nomina;
