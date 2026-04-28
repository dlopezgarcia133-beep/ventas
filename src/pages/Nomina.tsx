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
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { NominaEmpleado, NominaPeriodo } from "../Types";
import { obtenerRolDesdeToken } from "../components/Token";

import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";


const Nomina = () => {
  const token = localStorage.getItem("token");

  const esAdmin = obtenerRolDesdeToken() === "admin";

  const [periodo, setPeriodo] = useState<NominaPeriodo | null>(null);
  const [nomina, setNomina] = useState<NominaEmpleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [edicion, setEdicion] = useState<
    Record<number, {
      horas_extra: number
      precio_hora_extra: number
      sanciones?: number;
      comisiones_pendientes?: number;
    }>
  >({});

  const [editandoSueldo, setEditandoSueldo] = useState(false);
  const [sueldoBase, setSueldoBase] = useState<number>(0);



  const [inicioA, setInicioA] = useState<string | null>(null);
  const [finA, setFinA] = useState<string | null>(null);

  const [inicioC, setInicioC] = useState<string | null>(null);
  const [finC, setFinC] = useState<string | null>(null);



  const [resumenEmpleado, setResumenEmpleado] = useState<any>(null);

  const [tabActiva, setTabActiva] = useState(0);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<"A" | "C" | "">("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<NominaEmpleado | null>(null);


  const empleadosGrupo = nomina.filter(e =>
    grupoSeleccionado === "A"
      ? e.username.startsWith("A")
      : grupoSeleccionado === "C"
        ? e.username.startsWith("C")
        : false
  );

  // 🔹 Derivados
  const asesores = nomina.filter(e => e.username.startsWith("A"));
  const encargados = nomina.filter(e => e.username.startsWith("C"));




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

    // 🔹 sincronizar fechas
    setInicioA(res.data.inicio_a);
    setFinA(res.data.fin_a);
    setInicioC(res.data.inicio_c);
    setFinC(res.data.fin_c);

  } catch (err: any) {
    if (err.response?.status === 404) {
      setPeriodo(null);
      setNomina([]);
    } else {
      console.error("Error al obtener periodo activo:", err);
    }
  }
};


  const guardarFechasPeriodo = async () => {
  try {
    const payload: any = {};

    if (inicioA && finA) {
      payload.inicio_a = inicioA;
      payload.fin_a = finA;
    }

    if (inicioC && finC) {
      payload.inicio_c = inicioC;
      payload.fin_c = finC;
    }

    await axios.put(
      `${process.env.REACT_APP_API_URL}/nomina/periodo/fechas`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // 🔄 Recargar todo
    await fetchPeriodoActivo();
    await fetchResumenNomina();

  } catch (error) {
    console.error("Error al guardar fechas del periodo", error);
    alert("Error al guardar fechas");
  }
};


  const fetchResumenNomina = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (inicioA && finA) {
        params.inicio_a = inicioA;
        params.fin_a = finA;
      }

      if (inicioC && finC) {
        params.inicio_c = inicioC;
        params.fin_c = finC;
      }

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/resumen`,
        {
          params,
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



  const calcularTotalFila = (e: NominaEmpleado) => {
    const sueldo = e.sueldo_base || 0;
    const comisiones = e.comisiones || 0;

    const horasExtra = edicion[e.usuario_id]?.horas_extra ?? e.horas_extra ?? 0;
    const precioHora =
      edicion[e.usuario_id]?.precio_hora_extra ?? e.precio_hora_extra ?? 0;

    const pagoHorasExtra = horasExtra * precioHora;

    const sanc =
      edicion[e.usuario_id]?.sanciones ?? e.sanciones ?? 0;

    const comPend =
      edicion[e.usuario_id]?.comisiones_pendientes ?? e.comisiones_pendientes ?? 0;


    return sueldo + comisiones + pagoHorasExtra + comPend - sanc;
  };



  const fetchResumenEmpleado = async (
    usuarioId: number,
    grupo: "A" | "C"
  ) => {
    const fechas =
      grupo === "A"
        ? { inicio: inicioA, fin: finA }
        : { inicio: inicioC, fin: finC };

    if (!fechas.inicio || !fechas.fin) {
      setResumenEmpleado(null);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/resumen/empleado/${usuarioId}`,
        {
          params: {
            fecha_inicio: fechas.inicio,
            fecha_fin: fechas.fin,
          },
          headers: { Authorization: `Bearer ${token}` },
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
    horasExtra: number,
    extras?: {
      precio_hora_extra?: number;
      sanciones?: number;
      comisiones_pendientes?: number;
    }

  ) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/nomina/empleado/${usuarioId}`,
      {
        horas_extra: horasExtra,
        ...(extras ?? {})

      },
      { headers: { Authorization: `Bearer ${token}` } }
    );


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

  const guardarSueldoBase = async (usuarioId: number) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/registro/usuarios/${usuarioId}/sueldo`,
      { sueldo_base: sueldoBase },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchResumenNomina(); // refresca totales
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
  if (!empleadoSeleccionado) return;

  setEdicion(prev => ({
    ...prev,
    [empleadoSeleccionado.usuario_id]: {
      horas_extra: empleadoSeleccionado.horas_extra || 0,
      precio_hora_extra: empleadoSeleccionado.precio_hora_extra || 0,
      sanciones: empleadoSeleccionado.sanciones || 0,
      comisiones_pendientes: empleadoSeleccionado.comisiones_pendientes || 0,
    }
  }));
}, [empleadoSeleccionado]);




  useEffect(() => {
    const base: any = {};
    nomina.forEach(e => {
      base[e.usuario_id] = {
        horas_extra: e.horas_extra,
        precio_hora_extra: e.precio_hora_extra || 0,
        sanciones: e.sanciones || 0,
        comisiones_pendientes: e.comisiones_pendientes || 0,
      };

    });
    setEdicion(prev => {
  const nuevo: any = { ...prev };

  nomina.forEach(e => {
    if (!nuevo[e.usuario_id]) {
      nuevo[e.usuario_id] = {
        horas_extra: e.horas_extra,
        precio_hora_extra: e.precio_hora_extra || 0,
        sanciones: e.sanciones || 0,
        comisiones_pendientes: e.comisiones_pendientes || 0,
      };
    }
  });

  return nuevo;
});
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
            <TableCell align="right">Sanciones</TableCell>
            <TableCell align="right">Comisiones pendientes</TableCell>  
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((e) => (
            <TableRow key={e.usuario_id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setEmpleadoSeleccionado(e);
                fetchResumenEmpleado(e.usuario_id, e.username.startsWith("A") ? "A" : "C");
              }}>
              <TableCell>{e.username}</TableCell>
              <TableCell align="right">${e.comisiones}</TableCell>

              <TableCell align="right">
                ${e.sueldo_base}

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

              <TableCell align="right">
                ${(edicion[e.usuario_id]?.horas_extra ?? e.horas_extra ?? 0) *
                  (edicion[e.usuario_id]?.precio_hora_extra ?? e.precio_hora_extra ?? 0)}
              </TableCell>

              <TableCell align="right">
                {esAdmin ? (
                  <TextField
                    size="small"
                    type="number"
                    value={edicion[e.usuario_id]?.sanciones ?? e.sanciones ?? 0}
                    onChange={(ev) =>
                      setEdicion(prev => ({
                        ...prev,
                        [e.usuario_id]: {
                          ...prev[e.usuario_id],
                          sanciones: Number(ev.target.value)
                        }
                      }))
                    }
                  />
                ) : (
                  e.sanciones ?? 0
                )}
              </TableCell>

              <TableCell align="right">
                {esAdmin ? (
                  <TextField
                    size="small"
                    type="number"
                    value={edicion[e.usuario_id]?.comisiones_pendientes ?? e.comisiones_pendientes ?? 0}
                    onChange={(ev) =>
                      setEdicion(prev => ({
                        ...prev,
                        [e.usuario_id]: {
                          ...prev[e.usuario_id],
                          comisiones_pendientes: Number(ev.target.value)
                        }
                      }))
                    }
                  />
                ) : (
                  e.comisiones_pendientes ?? 0
                )}
              </TableCell>


              <TableCell align="right">
                <strong>
                  ${calcularTotalFila(e).toFixed(2)}
                </strong>
              </TableCell>






            </TableRow>
          ))}
        </TableBody>
      </Table>

    </Paper>
  );

  return (
    <Box display="flex" gap={3} alignItems="flex-start" sx={{ height: "100vh"}}>

      {/* PANEL IZQUIERDO */}
      <Paper sx={{
        p: 2,
    width: 300,
    height: "100%",
    overflowY: "auto",
    flexShrink: 0
      }}>
        <Typography variant="h6" gutterBottom>
          Detalle del empleado
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Grupo</InputLabel>
          <Select
            value={grupoSeleccionado}
            label="Grupo"
            onChange={(e) => {
              setGrupoSeleccionado(e.target.value as "A" | "C");
              setEmpleadoSeleccionado(null);
              setResumenEmpleado(null);

            }}
          >
            <MenuItem value="A">Grupo A</MenuItem>
            <MenuItem value="C">Grupo C</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }} disabled={!grupoSeleccionado}>
          <InputLabel>Empleado</InputLabel>
          <Select
            value={empleadoSeleccionado?.usuario_id ?? ""}
            label="Empleado"
            onChange={(e) => {
              const emp = empleadosGrupo.find(
                x => x.usuario_id === e.target.value
              );
              if (emp) {
                setEmpleadoSeleccionado(emp);
                setSueldoBase(emp.sueldo_base);
                fetchResumenEmpleado(
                  emp.usuario_id,
                  emp.username.startsWith("A") ? "A" : "C"
                );


              }
            }}
          >
            {empleadosGrupo.map(emp => (
              <MenuItem key={emp.usuario_id} value={emp.usuario_id}>
                {emp.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!empleadoSeleccionado && (
          <Typography color="text.secondary">
            Selecciona un empleado
          </Typography>
        )}
        {empleadoSeleccionado && resumenEmpleado && (
          <>
            <Typography variant="subtitle2" mt={2}>Comisiones</Typography>
            <Typography>Accesorios: ${resumenEmpleado.accesorios}</Typography>
            <Typography>Teléfonos: ${resumenEmpleado.telefonos}</Typography>
            <Typography>Chips: ${resumenEmpleado.chips}</Typography>
            <Typography fontWeight="bold">
              Total: ${resumenEmpleado.total_comisiones}
            </Typography>

            <Typography variant="subtitle2" mt={2}>Nómina</Typography>

            <TextField
              type="number"
              value={sueldoBase || ""}
              onChange={(e) => setSueldoBase(Number(e.target.value))}
            />

            <Button
              variant="contained"
              onClick={() => guardarSueldoBase(empleadoSeleccionado.usuario_id)}
            >
              Guardar sueldo
            </Button>


            <TextField
              label="Horas extra"
              type="number"
              fullWidth
              sx={{ mt: 1 }}
              value={edicion[empleadoSeleccionado.usuario_id]?.horas_extra ?? ""}
              onChange={(e) =>
                setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: {
                    ...prev[empleadoSeleccionado.usuario_id],
                    horas_extra: Number(e.target.value)
                  }
                }))
              }
            />
            <TextField
              label="Precio por hora extra"
              type="number"
              fullWidth
              sx={{ mt: 1 }}
              value={edicion[empleadoSeleccionado.usuario_id]?.precio_hora_extra ?? ""}
              onChange={(e) =>
                setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: {
                    ...prev[empleadoSeleccionado.usuario_id],
                    precio_hora_extra: Number(e.target.value)
                  }
                }))
              }
            />

            <TextField
              label="Sanciones (-)"
              type="number"
              fullWidth
              sx={{ mt: 1 }}
              value={edicion[empleadoSeleccionado.usuario_id]?.sanciones ?? 0}
              onChange={(e) =>
                setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: {
                    ...prev[empleadoSeleccionado.usuario_id],
                    sanciones: Number(e.target.value)
                  }
                }))
              }
            />
            <TextField
              label="Comisiones pendientes (+)"
              type="number"
              fullWidth
              sx={{ mt: 1 }}
              value={edicion[empleadoSeleccionado.usuario_id]?.comisiones_pendientes ?? 0}
              onChange={(e) =>
                setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: {
                    ...prev[empleadoSeleccionado.usuario_id],
                    comisiones_pendientes: Number(e.target.value)
                  }
                }))
              }
            />




            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={async () => {
                if (!empleadoSeleccionado) return;

                const data = edicion[empleadoSeleccionado.usuario_id];

                await actualizarNominaEmpleado(
                  empleadoSeleccionado.usuario_id,
                  data?.horas_extra || 0,
                  {
                    precio_hora_extra: data?.precio_hora_extra || 0,
                    sanciones: data?.sanciones || 0,
                    comisiones_pendientes: data?.comisiones_pendientes || 0,
                  }
                );

                // 🔄 refresca desde backend
                fetchResumenNomina();
              }}
            >
              Guardar
            </Button>


          </>
        )}
      </Paper>



      <Box flex={1}
        sx={{
          height: "100%",
          overflowY: "auto"
        }}>

        {esAdmin && (
          <TextField
            type="date"
            label={periodo ? "Periodo activo" : "Inicio del periodo"}
            InputLabelProps={{ shrink: true }}
            disabled={!!periodo}
            onChange={(e) =>
              activarPeriodoNomina(
                dayjs(e.target.value),
                dayjs(e.target.value).add(6, "day")
              )
            }
          />
        )}

        {!periodo && (
          <Typography color="text.secondary">
            El administrador aún no ha definido el periodo de nómina
          </Typography>
        )}

        {periodo && (
          <Typography color="text.secondary">
            Periodo activo: {periodo.fecha_inicio} → {periodo.fecha_fin}
          </Typography>
        )}

        {esAdmin && periodo && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rangos de comisiones
            </Typography>

            {/* GRUPO A */}
            <Typography fontWeight="bold" mt={1}>Grupo A</Typography>
            <Box display="flex" gap={2} mt={1}>
              <TextField
                type="date"
                label="Inicio A"
                value={inicioA || ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInicioA(e.target.value)}
              />
              <TextField
                type="date"
                label="Fin A"
                value={finA || ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFinA(e.target.value)}
              />
            </Box>

            {/* GRUPO C */}
            <Typography fontWeight="bold" mt={3}>Grupo C (manual)</Typography>
            <Box display="flex" gap={2} mt={1}>
              <TextField
                type="date"
                label="Inicio C"
                value={inicioC || ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInicioC(e.target.value)}
              />
              <TextField
                type="date"
                label="Fin C"
                value={finC || ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setFinC(e.target.value)}
              />
            </Box>
          </Paper>
          
          
        )}
        <Button
  variant="contained"
  sx={{ mt: 2 }}
  onClick={guardarFechasPeriodo}
>
  Guardar rangos de comisiones
</Button>



        {periodo && !loading && (
          <>
            <Tabs
              value={tabActiva}
              onChange={(_, v) => setTabActiva(v)}
              sx={{ mb: 2 }}
            >
              <Tab label="Asesores (A)" />
              <Tab label="Encargados (C)" />
            </Tabs>

            {tabActiva === 0 && renderTabla("Asesores (A)", asesores)}
            {tabActiva === 1 && renderTabla("Encargados (C)", encargados)}

            {esAdmin && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={async () => {
                  for (const e of nomina) {
                    await actualizarNominaEmpleado(
                      e.usuario_id,
                      Number(edicion[e.usuario_id]?.horas_extra || 0),
                      {
                        precio_hora_extra: edicion[e.usuario_id]?.precio_hora_extra || 0,
                        sanciones: edicion[e.usuario_id]?.sanciones || 0,
                        comisiones_pendientes: edicion[e.usuario_id]?.comisiones_pendientes || 0,
                      }
                    );
                  }

                  // ✅ AHORA sí refrescas todo
                  fetchResumenNomina();
                }}
              >
                Guardar cambios
              </Button>
            )}


            {esAdmin && (
              <Box display="flex" gap={2}>
                <Button variant="contained" color="error" onClick={cerrarNomina}>
                  Cerrar nómina
                </Button>

                <Button variant="outlined" onClick={descargarNominaExcel}>
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
