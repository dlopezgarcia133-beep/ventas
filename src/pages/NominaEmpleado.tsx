import { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, CircularProgress, Alert } from "@mui/material";
import { MiNominaResponse } from "../Types";

const CICLO_INICIO   = "11 Abr 2026";
const CICLO_FIN      = "17 Abr 2026";
const FECHA_PAGO_FIJA = "miércoles, 29 de abril de 2026";

const lunesDeHoy = (): string => {
  const hoy = new Date();
  const offset = (hoy.getDay() + 6) % 7;
  hoy.setDate(hoy.getDate() - offset);
  return hoy.toISOString().split("T")[0];
};

export default function NominaEmpleado() {
  const [data,      setData]      = useState<MiNominaResponse | null>(null);
  const [historial, setHistorial] = useState<any | null>(null);
  const [loading,   setLoading]   = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargar = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      // Resumen del periodo activo
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-resumen`,
          { headers }
        );
        if (res.ok) setData(await res.json());
      } catch (_) {}

      // Historial de la semana actual (para horas_faltantes y valores guardados)
      try {
        const semana = lunesDeHoy();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-historial?semana_inicio=${semana}`,
          { headers }
        );
        if (res.ok) {
          const json = await res.json();
          if (json) setHistorial(json);
        }
      } catch (_) {}

      setLoading(false);
    };
    cargar();
  }, []); // eslint-disable-line

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  const Row = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <Box display="flex" justifyContent="space-between" mb={0.75}>
      <Typography color={color}>{label}</Typography>
      <Typography fontWeight="bold" color={color}>{value}</Typography>
    </Box>
  );

  // Usar valores del historial si existen, si no los del resumen activo
  const horasFaltantes   = historial?.horas_faltantes   ?? 0;
  const precioHora       = historial?.precio_hora_extra  ?? data?.sueldo?.pago_horas_extra ?? 0;
  const descuentoFalt    = horasFaltantes * (historial?.precio_hora_extra ?? 0);

  return (
    <Box maxWidth={600} mx="auto" p={2.5}>
      <Typography variant="h5" align="center" gutterBottom>
        💰 Mi Nómina
      </Typography>

      {/* EMPLEADO / PERIODO */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>👤 Empleado</Typography>
        {data ? (
          <>
            <Typography fontWeight="bold">{data.empleado.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              Periodo: {data.periodo.inicio} → {data.periodo.fin}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Periodo: {CICLO_INICIO} → {CICLO_FIN}
          </Typography>
        )}
      </Paper>

      {/* COMISIONES */}
      {data ? (
        <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>📊 Comisiones</Typography>
          <Row label="Accesorios"  value={`$${data.comisiones.accesorios}`} />
          <Row label="Teléfonos"   value={`$${data.comisiones.telefonos}`} />
          <Row label="Chips"       value={`$${data.comisiones.chips}`} />
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography fontWeight="bold" fontSize={16}>Total comisiones</Typography>
            <Typography fontWeight="bold" fontSize={16}>${data.comisiones.total}</Typography>
          </Box>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Las comisiones se mostrarán cuando administración confirme el período.
        </Alert>
      )}

      {/* SUELDO */}
      {data && (
        <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>💼 Sueldo</Typography>
          <Row label="Sueldo base"           value={`$${historial?.sueldo_base ?? data.sueldo.base}`} />
          <Row label="Horas extra"           value={historial?.horas_extra ?? data.sueldo.horas_extra} />
          <Row label="Pago horas extra"      value={`$${historial?.pago_horas_extra ?? data.sueldo.pago_horas_extra}`} />
          <Row label="Comisiones pendientes" value={`$${historial?.comisiones_pendientes ?? data.sueldo.comisiones_pendientes ?? 0}`} />
          <Row label="Sanciones"             value={`-$${historial?.sanciones ?? data.sueldo.sanciones ?? 0}`} />

          {horasFaltantes > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Row
                label={`Horas faltantes (${horasFaltantes} hrs)`}
                value={`-$${descuentoFalt.toFixed(2)}`}
                color="error.main"
              />
            </>
          )}
        </Paper>
      )}

      {/* TOTAL */}
      {data && (
        <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3, bgcolor: "#f97316", color: "white", textAlign: "center" }}>
          <Typography variant="h6">Total a pagar</Typography>
          <Typography variant="h4" fontWeight="bold">
            ${historial?.total_pagar ?? data.total_pagar}
          </Typography>
        </Paper>
      )}

      {/* FECHA DE PAGO */}
      <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#fff7ed", border: "1px solid rgba(249,115,22,0.25)", textAlign: "center" }}>
        <Typography>
          📅 <strong>Fecha de pago</strong>
          <br />
          {FECHA_PAGO_FIJA}
        </Typography>
      </Paper>
    </Box>
  );
}
