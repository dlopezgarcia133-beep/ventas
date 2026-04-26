import { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, CircularProgress, Alert } from "@mui/material";
import { MiNominaResponse } from "../Types";

// Primer ciclo fijo para Cadenas C — aparece siempre, cierre o no
const CICLO_INICIO = "11 Abr 2026";
const CICLO_FIN = "17 Abr 2026";
const FECHA_PAGO_FIJA = "miércoles, 29 de abril de 2026";

export default function NominaEmpleado() {
  const [data, setData] = useState<MiNominaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarNomina = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-resumen`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
        // Si el período aún no está cerrado el backend devuelve error —
        // data queda en null pero igual mostramos el ciclo fijo.
      } catch (_) {
        // Sin datos: mostrar ciclo fijo igualmente
      } finally {
        setLoading(false);
      }
    };
    cargarNomina();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <Box display="flex" justifyContent="space-between" mb={0.75}>
      <Typography>{label}</Typography>
      <Typography fontWeight="bold">{value}</Typography>
    </Box>
  );

  return (
    <Box maxWidth={600} mx="auto" p={2.5}>
      <Typography variant="h5" align="center" gutterBottom>
        💰 Mi Nómina
      </Typography>

      {/* EMPLEADO / PERIODO — el ciclo fijo se muestra siempre */}
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
          <Row label="Accesorios" value={`$${data.comisiones.accesorios}`} />
          <Row label="Teléfonos" value={`$${data.comisiones.telefonos}`} />
          <Row label="Chips" value={`$${data.comisiones.chips}`} />
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
          <Row label="Sueldo base" value={`$${data.sueldo.base}`} />
          <Row label="Horas extra" value={data.sueldo.horas_extra} />
          <Row label="Pago horas extra" value={`$${data.sueldo.pago_horas_extra}`} />
          <Row label="Sanciones" value={`-$${data.sueldo?.sanciones ?? 0}`} />
          <Row label="Comisiones pendientes" value={`$${data.sueldo?.comisiones_pendientes ?? 0}`} />
        </Paper>
      )}

      {/* TOTAL */}
      {data && (
        <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3, bgcolor: "#f97316", color: "white", textAlign: "center" }}>
          <Typography variant="h6">Total a pagar</Typography>
          <Typography variant="h4" fontWeight="bold">${data.total_pagar}</Typography>
        </Paper>
      )}

      {/* FECHA DE PAGO — siempre fija: 29 Abr 2026 */}
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
