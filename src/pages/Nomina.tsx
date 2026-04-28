import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { NominaEmpleado, NominaPeriodo } from "../Types";
import { obtenerRolDesdeToken } from "../components/Token";

// ── Utilidades de semana ──────────────────────────────────────────────────────

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const calcularLunes = (ref: Dayjs = dayjs()): Dayjs => {
  // (day+6)%7 → 0 para lunes, 1 para martes, ..., 6 para domingo
  const offset = (ref.day() + 6) % 7;
  return ref.subtract(offset, "day").startOf("day");
};

const formatoSemana = (lunes: Dayjs): string => {
  const domingo = lunes.add(6, "day");
  const m1 = MESES[lunes.month()];
  const m2 = MESES[domingo.month()];
  if (lunes.month() === domingo.month())
    return `${lunes.date()} – ${domingo.date()} ${m2} ${domingo.year()}`;
  return `${lunes.date()} ${m1} – ${domingo.date()} ${m2} ${domingo.year()}`;
};

// ─────────────────────────────────────────────────────────────────────────────

const Nomina = () => {
  const token   = localStorage.getItem("token");
  const esAdmin = obtenerRolDesdeToken() === "admin";

  // ── Selector de semana ────────────────────────────────────────────────────
  const [semanaInicio, setSemanaInicio] = useState<Dayjs>(calcularLunes());

  // Fechas derivadas automáticamente (no son estado)
  const inicioA = semanaInicio.format("YYYY-MM-DD");
  const finA    = semanaInicio.add(6, "day").format("YYYY-MM-DD");
  const inicioC = semanaInicio.subtract(9, "day").format("YYYY-MM-DD"); // sábado semana anterior
  const finC    = semanaInicio.subtract(3, "day").format("YYYY-MM-DD"); // viernes semana anterior

  // ── Estado principal ──────────────────────────────────────────────────────
  const [periodo, setPeriodo] = useState<NominaPeriodo | null>(null);
  const [nomina,  setNomina]  = useState<NominaEmpleado[]>([]);
  const [loading, setLoading] = useState(false);

  const [edicion, setEdicion] = useState<
    Record<number, {
      horas_extra: number;
      precio_hora_extra: number;
      sanciones?: number;
      comisiones_pendientes?: number;
    }>
  >({});

  const [sueldoBase,          setSueldoBase]          = useState<number>(0);
  const [resumenEmpleado,     setResumenEmpleado]      = useState<any>(null);
  const [tabActiva,           setTabActiva]            = useState(0);
  const [grupoSeleccionado,   setGrupoSeleccionado]    = useState<"A" | "C" | "">("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<NominaEmpleado | null>(null);

  // ── Historial ─────────────────────────────────────────────────────────────
  const [modoHistorial,      setModoHistorial]      = useState(false);
  const [semanasGuardadas,   setSemanasGuardadas]   = useState<string[]>([]);
  const [semanaHistorial,    setSemanaHistorial]    = useState<string>("");
  const [nominaHistorial,    setNominaHistorial]    = useState<any[]>([]);
  const [cargandoHistorial,  setCargandoHistorial]  = useState(false);

  // ── Guardar nómina ────────────────────────────────────────────────────────
  const [guardando, setGuardando] = useState(false);
  const [alerta,    setAlerta]    = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const asesores   = nomina.filter(e => e.username.startsWith("A")).sort((a, b) => a.username.localeCompare(b.username));
  const encargados = nomina.filter(e => e.username.startsWith("C")).sort((a, b) => a.username.localeCompare(b.username));
  const empleadosGrupo = nomina.filter(e =>
    grupoSeleccionado === "A" ? e.username.startsWith("A") :
    grupoSeleccionado === "C" ? e.username.startsWith("C") : false
  );

  // ── API ───────────────────────────────────────────────────────────────────

  const fetchPeriodoActivo = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/periodo/activo`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPeriodo(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) { setPeriodo(null); setNomina([]); }
      else console.error("Error al obtener periodo activo:", err);
    }
  };

  const fetchResumenNomina = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/resumen`,
        {
          params: { inicio_a: inicioA, fin_a: finA, inicio_c: inicioC, fin_c: finC },
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
    const sueldo   = e.sueldo_base || 0;
    const comis    = e.comisiones  || 0;
    const horas    = edicion[e.usuario_id]?.horas_extra            ?? e.horas_extra            ?? 0;
    const precio   = edicion[e.usuario_id]?.precio_hora_extra      ?? e.precio_hora_extra      ?? 0;
    const sanc     = edicion[e.usuario_id]?.sanciones              ?? e.sanciones              ?? 0;
    const comPend  = edicion[e.usuario_id]?.comisiones_pendientes  ?? e.comisiones_pendientes  ?? 0;
    return sueldo + comis + horas * precio + comPend - sanc;
  };

  const fetchResumenEmpleado = async (usuarioId: number, grupo: "A" | "C") => {
    const inicio = grupo === "A" ? inicioA : inicioC;
    const fin    = grupo === "A" ? finA    : finC;
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/resumen/empleado/${usuarioId}`,
        {
          params: { fecha_inicio: inicio, fecha_fin: fin },
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
        { fecha_inicio: inicio.format("YYYY-MM-DD"), fecha_fin: fin.format("YYYY-MM-DD") },
        { headers: { Authorization: `Bearer ${token}` } }
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
    extras?: { precio_hora_extra?: number; sanciones?: number; comisiones_pendientes?: number }
  ) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/nomina/empleado/${usuarioId}`,
      { horas_extra: horasExtra, ...(extras ?? {}) },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const cerrarNomina = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/nomina/cerrar`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPeriodo(null); setNomina([]);
    } catch (err) { console.error("Error al cerrar nómina:", err); }
  };

  const descargarNominaExcel = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/descargar`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", "nomina.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) { console.error("Error al descargar nómina:", err); }
  };

  const guardarSueldoBase = async (usuarioId: number) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/registro/usuarios/${usuarioId}/sueldo`,
      { sueldo_base: sueldoBase },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchResumenNomina();
  };

  // ── Historial ─────────────────────────────────────────────────────────────

  const fetchSemanasGuardadas = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/historial/semanas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSemanasGuardadas(res.data);
    } catch (err) { console.error("Error al cargar semanas:", err); }
  };

  const fetchHistorialSemana = async (semana: string) => {
    setCargandoHistorial(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/nomina/historial`,
        { params: { semana_inicio: semana }, headers: { Authorization: `Bearer ${token}` } }
      );
      setNominaHistorial(res.data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setNominaHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const guardarNomina = async () => {
    setGuardando(true);
    setAlerta(null);
    try {
      const empleados = nomina.map(e => {
        const ed     = edicion[e.usuario_id] ?? {} as any;
        const horas  = ed.horas_extra            ?? e.horas_extra            ?? 0;
        const precio = ed.precio_hora_extra      ?? e.precio_hora_extra      ?? 0;
        const sanc   = ed.sanciones              ?? e.sanciones              ?? 0;
        const comP   = ed.comisiones_pendientes  ?? e.comisiones_pendientes  ?? 0;
        return {
          usuario_id:            e.usuario_id,
          username:              e.username,
          grupo:                 e.username.startsWith("A") ? "A" : "C",
          comisiones_accesorios: 0,
          comisiones_telefonos:  0,
          comisiones_chips:      0,
          comisiones_total:      e.comisiones,
          sueldo_base:           e.sueldo_base,
          horas_extra:           horas,
          precio_hora_extra:     precio,
          pago_horas_extra:      horas * precio,
          sanciones:             sanc,
          comisiones_pendientes: comP,
          total_pagar:           calcularTotalFila(e),
        };
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL}/nomina/historial`,
        {
          semana_inicio:       inicioA,
          semana_fin:          finA,
          comisiones_inicio_a: inicioA,
          comisiones_fin_a:    finA,
          comisiones_inicio_c: inicioC,
          comisiones_fin_c:    finC,
          empleados,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlerta({ tipo: "success", texto: `Nómina "${formatoSemana(semanaInicio)}" guardada correctamente` });
    } catch {
      setAlerta({ tipo: "error", texto: "Error al guardar la nómina" });
    } finally {
      setGuardando(false);
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => { fetchPeriodoActivo(); }, []); // eslint-disable-line

  // Re-fetch cuando cambia el periodo O la semana seleccionada
  useEffect(() => {
    if (periodo) fetchResumenNomina();
  }, [periodo, semanaInicio]); // eslint-disable-line

  useEffect(() => {
    if (!empleadoSeleccionado) return;
    setEdicion(prev => ({
      ...prev,
      [empleadoSeleccionado.usuario_id]: {
        horas_extra:           empleadoSeleccionado.horas_extra            || 0,
        precio_hora_extra:     empleadoSeleccionado.precio_hora_extra      || 0,
        sanciones:             empleadoSeleccionado.sanciones              || 0,
        comisiones_pendientes: empleadoSeleccionado.comisiones_pendientes  || 0,
      },
    }));
  }, [empleadoSeleccionado]);

  useEffect(() => {
    setEdicion(prev => {
      const nuevo: any = { ...prev };
      nomina.forEach(e => {
        if (!nuevo[e.usuario_id]) {
          nuevo[e.usuario_id] = {
            horas_extra:           e.horas_extra,
            precio_hora_extra:     e.precio_hora_extra      || 0,
            sanciones:             e.sanciones              || 0,
            comisiones_pendientes: e.comisiones_pendientes  || 0,
          };
        }
      });
      return nuevo;
    });
  }, [nomina]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderTabla = (titulo: string, data: NominaEmpleado[], soloLectura = false) => (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>{titulo}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Empleado</TableCell>
            <TableCell align="right">Comisiones</TableCell>
            <TableCell align="right">Sueldo base</TableCell>
            <TableCell align="right">Horas extra</TableCell>
            <TableCell align="right">Pago horas</TableCell>
            <TableCell align="right">Sanciones</TableCell>
            <TableCell align="right">Com. pendientes</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(e => (
            <TableRow
              key={e.usuario_id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setEmpleadoSeleccionado(e);
                fetchResumenEmpleado(e.usuario_id, e.username.startsWith("A") ? "A" : "C");
              }}
            >
              <TableCell>{e.username}</TableCell>
              <TableCell align="right">${e.comisiones}</TableCell>
              <TableCell align="right">${e.sueldo_base}</TableCell>

              <TableCell align="right">
                {esAdmin && !soloLectura ? (
                  <TextField
                    size="small" type="number"
                    value={edicion[e.usuario_id]?.horas_extra ?? 0}
                    onClick={ev => ev.stopPropagation()}
                    onChange={ev => setEdicion(prev => ({
                      ...prev,
                      [e.usuario_id]: { ...prev[e.usuario_id], horas_extra: Number(ev.target.value) },
                    }))}
                  />
                ) : (e.horas_extra)}
              </TableCell>

              <TableCell align="right">
                ${(edicion[e.usuario_id]?.horas_extra ?? e.horas_extra ?? 0) *
                   (edicion[e.usuario_id]?.precio_hora_extra ?? e.precio_hora_extra ?? 0)}
              </TableCell>

              <TableCell align="right">
                {esAdmin && !soloLectura ? (
                  <TextField
                    size="small" type="number"
                    value={edicion[e.usuario_id]?.sanciones ?? e.sanciones ?? 0}
                    onClick={ev => ev.stopPropagation()}
                    onChange={ev => setEdicion(prev => ({
                      ...prev,
                      [e.usuario_id]: { ...prev[e.usuario_id], sanciones: Number(ev.target.value) },
                    }))}
                  />
                ) : (e.sanciones ?? 0)}
              </TableCell>

              <TableCell align="right">
                {esAdmin && !soloLectura ? (
                  <TextField
                    size="small" type="number"
                    value={edicion[e.usuario_id]?.comisiones_pendientes ?? e.comisiones_pendientes ?? 0}
                    onClick={ev => ev.stopPropagation()}
                    onChange={ev => setEdicion(prev => ({
                      ...prev,
                      [e.usuario_id]: { ...prev[e.usuario_id], comisiones_pendientes: Number(ev.target.value) },
                    }))}
                  />
                ) : (e.comisiones_pendientes ?? 0)}
              </TableCell>

              <TableCell align="right">
                <strong>${calcularTotalFila(e).toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  const renderTablaHistorial = (titulo: string, data: any[]) => (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>{titulo}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Empleado</TableCell>
            <TableCell align="right">Comisiones</TableCell>
            <TableCell align="right">Sueldo base</TableCell>
            <TableCell align="right">Horas extra</TableCell>
            <TableCell align="right">Pago horas</TableCell>
            <TableCell align="right">Sanciones</TableCell>
            <TableCell align="right">Com. pendientes</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(e => (
            <TableRow key={e.id ?? e.usuario_id}>
              <TableCell>{e.username}</TableCell>
              <TableCell align="right">${e.comisiones_total}</TableCell>
              <TableCell align="right">${e.sueldo_base}</TableCell>
              <TableCell align="right">{e.horas_extra}</TableCell>
              <TableCell align="right">${e.pago_horas_extra}</TableCell>
              <TableCell align="right">${e.sanciones}</TableCell>
              <TableCell align="right">${e.comisiones_pendientes}</TableCell>
              <TableCell align="right">
                <strong>${Number(e.total_pagar).toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <Box display="flex" gap={3} alignItems="flex-start" sx={{ height: "100vh" }}>

      {/* PANEL IZQUIERDO — oculto en modo historial */}
      {!modoHistorial && (
        <Paper sx={{ p: 2, width: 300, height: "100%", overflowY: "auto", flexShrink: 0 }}>
          <Typography variant="h6" gutterBottom>Detalle del empleado</Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Grupo</InputLabel>
            <Select
              value={grupoSeleccionado}
              label="Grupo"
              onChange={e => {
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
              onChange={e => {
                const emp = empleadosGrupo.find(x => x.usuario_id === e.target.value);
                if (emp) {
                  setEmpleadoSeleccionado(emp);
                  setSueldoBase(emp.sueldo_base);
                  fetchResumenEmpleado(emp.usuario_id, emp.username.startsWith("A") ? "A" : "C");
                }
              }}
            >
              {empleadosGrupo.map(emp => (
                <MenuItem key={emp.usuario_id} value={emp.usuario_id}>{emp.username}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {!empleadoSeleccionado && (
            <Typography color="text.secondary">Selecciona un empleado</Typography>
          )}

          {empleadoSeleccionado && resumenEmpleado && (
            <>
              <Typography variant="subtitle2" mt={2}>Comisiones</Typography>
              <Typography>Accesorios: ${resumenEmpleado.accesorios}</Typography>
              <Typography>Teléfonos: ${resumenEmpleado.telefonos}</Typography>
              <Typography>Chips: ${resumenEmpleado.chips}</Typography>
              <Typography fontWeight="bold">Total: ${resumenEmpleado.total_comisiones}</Typography>

              <Typography variant="subtitle2" mt={2}>Nómina</Typography>

              <TextField
                type="number"
                value={sueldoBase || ""}
                onChange={e => setSueldoBase(Number(e.target.value))}
              />
              <Button variant="contained" onClick={() => guardarSueldoBase(empleadoSeleccionado.usuario_id)}>
                Guardar sueldo
              </Button>

              <TextField
                label="Horas extra" type="number" fullWidth sx={{ mt: 1 }}
                value={edicion[empleadoSeleccionado.usuario_id]?.horas_extra ?? ""}
                onChange={e => setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: { ...prev[empleadoSeleccionado.usuario_id], horas_extra: Number(e.target.value) },
                }))}
              />
              <TextField
                label="Precio por hora extra" type="number" fullWidth sx={{ mt: 1 }}
                value={edicion[empleadoSeleccionado.usuario_id]?.precio_hora_extra ?? ""}
                onChange={e => setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: { ...prev[empleadoSeleccionado.usuario_id], precio_hora_extra: Number(e.target.value) },
                }))}
              />
              <TextField
                label="Sanciones (-)" type="number" fullWidth sx={{ mt: 1 }}
                value={edicion[empleadoSeleccionado.usuario_id]?.sanciones ?? 0}
                onChange={e => setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: { ...prev[empleadoSeleccionado.usuario_id], sanciones: Number(e.target.value) },
                }))}
              />
              <TextField
                label="Comisiones pendientes (+)" type="number" fullWidth sx={{ mt: 1 }}
                value={edicion[empleadoSeleccionado.usuario_id]?.comisiones_pendientes ?? 0}
                onChange={e => setEdicion(prev => ({
                  ...prev,
                  [empleadoSeleccionado.usuario_id]: { ...prev[empleadoSeleccionado.usuario_id], comisiones_pendientes: Number(e.target.value) },
                }))}
              />

              <Button
                variant="contained" fullWidth sx={{ mt: 2 }}
                onClick={async () => {
                  if (!empleadoSeleccionado) return;
                  const data = edicion[empleadoSeleccionado.usuario_id];
                  await actualizarNominaEmpleado(
                    empleadoSeleccionado.usuario_id,
                    data?.horas_extra || 0,
                    {
                      precio_hora_extra:     data?.precio_hora_extra     || 0,
                      sanciones:             data?.sanciones             || 0,
                      comisiones_pendientes: data?.comisiones_pendientes || 0,
                    }
                  );
                  fetchResumenNomina();
                }}
              >
                Guardar
              </Button>
            </>
          )}
        </Paper>
      )}

      {/* PANEL DERECHO */}
      <Box flex={1} sx={{ height: "100%", overflowY: "auto" }}>

        {/* ── BARRA SUPERIOR: selector de semana + historial ── */}
        <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
          <IconButton
            size="small"
            onClick={() => setSemanaInicio(s => s.subtract(7, "day"))}
            sx={{ fontSize: 20 }}
          >
            ‹
          </IconButton>

          <Typography variant="h6" sx={{ minWidth: 240, textAlign: "center" }}>
            {formatoSemana(semanaInicio)}
          </Typography>

          <IconButton
            size="small"
            onClick={() => setSemanaInicio(s => s.add(7, "day"))}
            sx={{ fontSize: 20 }}
          >
            ›
          </IconButton>

          {/* Salto directo a cualquier semana */}
          <TextField
            type="date"
            size="small"
            value={semanaInicio.format("YYYY-MM-DD")}
            InputLabelProps={{ shrink: true }}
            inputProps={{ title: "Ir a la semana que contiene esta fecha" }}
            onChange={e => {
              if (e.target.value) setSemanaInicio(calcularLunes(dayjs(e.target.value)));
            }}
            sx={{ width: 160, ml: 1 }}
          />

          {esAdmin && !modoHistorial && (
            <Button
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
              onClick={() => { fetchSemanasGuardadas(); setModoHistorial(true); }}
            >
              Ver historial
            </Button>
          )}

          {modoHistorial && (
            <Button
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
              onClick={() => { setModoHistorial(false); setSemanaHistorial(""); setNominaHistorial([]); }}
            >
              ← Volver a nómina actual
            </Button>
          )}
        </Box>

        {/* Fechas calculadas (modo normal) */}
        {!modoHistorial && (
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Grupo A: {inicioA} – {finA}&nbsp;&nbsp;|&nbsp;&nbsp;Grupo C: {inicioC} – {finC}
          </Typography>
        )}

        {/* ════════════════ MODO HISTORIAL ════════════════ */}
        {modoHistorial && (
          <>
            <FormControl size="small" sx={{ minWidth: 280, mb: 3 }}>
              <InputLabel>Semana guardada</InputLabel>
              <Select
                value={semanaHistorial}
                label="Semana guardada"
                onChange={e => {
                  setSemanaHistorial(e.target.value);
                  fetchHistorialSemana(e.target.value);
                }}
              >
                {semanasGuardadas.length === 0 && (
                  <MenuItem disabled value="">Sin nóminas guardadas</MenuItem>
                )}
                {semanasGuardadas.map(s => (
                  <MenuItem key={s} value={s}>{formatoSemana(dayjs(s))}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {cargandoHistorial && <Typography color="text.secondary">Cargando...</Typography>}

            {!cargandoHistorial && nominaHistorial.length > 0 && (
              <>
                <Tabs value={tabActiva} onChange={(_, v) => setTabActiva(v)} sx={{ mb: 2 }}>
                  <Tab label="Asesores (A)" />
                  <Tab label="Encargados (C)" />
                </Tabs>
                {tabActiva === 0 && renderTablaHistorial("Asesores (A)", nominaHistorial.filter(e => e.grupo === "A"))}
                {tabActiva === 1 && renderTablaHistorial("Encargados (C)", nominaHistorial.filter(e => e.grupo === "C"))}
              </>
            )}

            {!cargandoHistorial && semanaHistorial && nominaHistorial.length === 0 && (
              <Typography color="text.secondary">No hay datos guardados para esta semana.</Typography>
            )}
          </>
        )}

        {/* ════════════════ MODO NORMAL ════════════════ */}
        {!modoHistorial && (
          <>
            {/* Activar periodo */}
            {esAdmin && (
              <TextField
                type="date"
                label={periodo ? "Periodo activo" : "Inicio del periodo"}
                InputLabelProps={{ shrink: true }}
                disabled={!!periodo}
                onChange={e => activarPeriodoNomina(dayjs(e.target.value), dayjs(e.target.value).add(6, "day"))}
                sx={{ mb: 1 }}
              />
            )}

            {!periodo && (
              <Typography color="text.secondary">
                El administrador aún no ha definido el periodo de nómina
              </Typography>
            )}
            {periodo && (
              <Typography color="text.secondary" mb={1}>
                Periodo activo: {periodo.fecha_inicio} → {periodo.fecha_fin}
              </Typography>
            )}

            {/* Tablas */}
            {periodo && !loading && (
              <>
                <Tabs value={tabActiva} onChange={(_, v) => setTabActiva(v)} sx={{ mb: 2 }}>
                  <Tab label="Asesores (A)" />
                  <Tab label="Encargados (C)" />
                </Tabs>

                {tabActiva === 0 && renderTabla("Asesores (A)", asesores)}
                {tabActiva === 1 && renderTabla("Encargados (C)", encargados)}

                {/* Botones de acción */}
                {esAdmin && (
                  <Box display="flex" gap={2} mt={2} flexWrap="wrap" alignItems="center">
                    {/* Guardar ajustes al backend (horas, sanciones, etc.) */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        for (const e of nomina) {
                          await actualizarNominaEmpleado(
                            e.usuario_id,
                            Number(edicion[e.usuario_id]?.horas_extra || 0),
                            {
                              precio_hora_extra:     edicion[e.usuario_id]?.precio_hora_extra     || 0,
                              sanciones:             edicion[e.usuario_id]?.sanciones             || 0,
                              comisiones_pendientes: edicion[e.usuario_id]?.comisiones_pendientes || 0,
                            }
                          );
                        }
                        fetchResumenNomina();
                      }}
                    >
                      Guardar cambios
                    </Button>

                    {/* Guardar snapshot de la semana en historial */}
                    <Button
                      variant="contained"
                      color="success"
                      disabled={guardando}
                      onClick={guardarNomina}
                    >
                      {guardando ? "Guardando..." : "Guardar Nómina"}
                    </Button>

                    <Button variant="contained" color="error" onClick={cerrarNomina}>
                      Cerrar nómina
                    </Button>

                    <Button variant="outlined" onClick={descargarNominaExcel}>
                      Descargar Excel
                    </Button>
                  </Box>
                )}

                {/* Alerta de resultado del guardado */}
                {alerta && (
                  <Alert
                    severity={alerta.tipo}
                    sx={{ mt: 2 }}
                    onClose={() => setAlerta(null)}
                  >
                    {alerta.texto}
                  </Alert>
                )}
              </>
            )}
          </>
        )}

      </Box>
    </Box>
  );
};

export default Nomina;
