import { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, CircularProgress, Alert, TextField, MenuItem } from "@mui/material";
import { MiNominaResponse } from "../Types";

// ─── Helpers de ciclos de nómina (Grupo C) ───────────────────────────────────

const ANCHOR_C = new Date(2026, 3, 18); // 18 Abr 2026
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

interface Ciclo { inicio: Date; fin: Date; pago: Date; }

function getCiclosC(): Ciclo[] {
  const ciclos: Ciclo[] = [];
  const current = new Date(ANCHOR_C);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  while (true) {
    const inicio = new Date(current);
    const fin = new Date(current);
    fin.setDate(fin.getDate() + 6);
    const pago = new Date(fin);
    pago.setDate(pago.getDate() + 12);

    const apareceDesde = new Date(inicio);
    apareceDesde.setDate(apareceDesde.getDate() + 7);

    if (apareceDesde > hoy) {
      if (ciclos.length === 0) ciclos.push({ inicio, fin, pago }); // siempre al menos el primero
      break;
    }

    ciclos.push({ inicio, fin, pago });
    current.setDate(current.getDate() + 7);
  }

  return ciclos.reverse();
}

function fmtDiaMes(d: Date): string {
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

function labelCicloC(c: Ciclo): string {
  return `${fmtDiaMes(c.inicio)} – ${fmtDiaMes(c.fin)} ${c.fin.getFullYear()} · Pago: ${fmtDiaMes(c.pago)}`;
}

function fmtFechaPago(d: Date): string {
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function NominaEmpleado() {
  const [data, setData] = useState<MiNominaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cicloIdx, setCicloIdx] = useState(0);
  const token = localStorage.getItem("token");

  const ciclos = getCiclosC();
  const cicloActual = ciclos[cicloIdx] ?? ciclos[0];

  useEffect(() => {
    const cargarNomina = async () => {
      setLoading(true);
      setData(null);
      try {
        const params = new URLSearchParams({
          fecha_inicio: cicloActual.inicio.toLocaleDateString('en-CA'),
          fecha_fin: cicloActual.fin.toLocaleDateString('en-CA'),
        });
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-resumen?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (_) {
        // Sin datos: se mostrará la alerta
      } finally {
        setLoading(false);
      }
    };
    cargarNomina();
  }, [cicloIdx]);

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

      {/* Selector de semana */}
      <TextField
        select
        size="small"
        label="Semana"
        value={cicloIdx}
        onChange={(e) => setCicloIdx(Number(e.target.value))}
        sx={{ mb: 2.5, minWidth: { xs: '100%', sm: 360 } }}
      >
        {ciclos.map((c, i) => (
          <MenuItem key={i} value={i}>{labelCicloC(c)}</MenuItem>
        ))}
      </TextField>

      {/* EMPLEADO / PERIODO */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>👤 Empleado</Typography>
        {data ? (
          <>
            <Typography fontWeight="bold">{data.empleado.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              Periodo: {fmtDiaMes(cicloActual.inicio)} → {fmtDiaMes(cicloActual.fin)} {cicloActual.fin.getFullYear()}
            </Typography>
          </>
        ) : loading ? (
          <Box display="flex" justifyContent="center" mt={1}><CircularProgress size={24} /></Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Periodo: {fmtDiaMes(cicloActual.inicio)} → {fmtDiaMes(cicloActual.fin)} {cicloActual.fin.getFullYear()}
          </Typography>
        )}
      </Paper>

      {/* COMISIONES */}
      {!loading && (
        data ? (
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
        )
      )}

      {/* SUELDO */}
      {!loading && data && (
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
      {!loading && data && (
        <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3, bgcolor: "#f97316", color: "white", textAlign: "center" }}>
          <Typography variant="h6">Total a pagar</Typography>
          <Typography variant="h4" fontWeight="bold">${data.total_pagar}</Typography>
        </Paper>
      )}

      {/* FECHA DE PAGO — dinámica según el ciclo seleccionado */}
      <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#fff7ed", border: "1px solid rgba(249,115,22,0.25)", textAlign: "center" }}>
        <Typography>
          📅 <strong>Fecha de pago</strong>
          <br />
          {fmtFechaPago(cicloActual.pago)}
        </Typography>
      </Paper>
    </Box>
  );
}
