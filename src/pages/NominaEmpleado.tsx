import { useEffect, useState } from "react";
import { Box, CircularProgress, Divider, Paper, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { MiNominaResponse } from "../Types";
import { obtenerRolDesdeToken } from "../components/Token";

const FECHA_PAGO_FIJA = "miércoles, 29 de abril de 2026";

const fmt = (n: number) => `$${Number(n).toFixed(2)}`;

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const fmtFecha = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
};

export default function NominaEmpleado() {
  const [data,      setData]      = useState<MiNominaResponse | null>(null);
  const [historial, setHistorial] = useState<any | null>(null);
  const [loading,   setLoading]   = useState(true);
  const token    = localStorage.getItem("token");
  const esAsesor = obtenerRolDesdeToken() === "asesor";

  useEffect(() => {
    const cargar = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/nomina/mi-resumen`, { headers });
        if (res.ok) setData(await res.json());
      } catch (_) {}

      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-historial`,
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

  // Valores — prioridad historial, fallback a data
  const sueldoBase     = historial?.sueldo_base             ?? data?.sueldo?.base                  ?? 0;
  const comisAcc       = historial?.comisiones_accesorios   ?? data?.comisiones?.accesorios         ?? 0;
  const comisTel       = historial?.comisiones_telefonos    ?? data?.comisiones?.telefonos           ?? 0;
  const comisChips     = historial?.comisiones_chips        ?? data?.comisiones?.chips               ?? 0;
  const comisTotal     = historial?.comisiones_total        ?? data?.comisiones?.total               ?? 0;
  const horasExtra     = historial?.horas_extra             ?? data?.sueldo?.horas_extra             ?? 0;
  const precioHora     = historial?.precio_hora_extra       ?? 0;
  const pagoHoras      = historial?.pago_horas_extra        ?? data?.sueldo?.pago_horas_extra        ?? 0;
  const comisPlanes    = historial?.comisiones_pendientes   ?? data?.sueldo?.comisiones_pendientes   ?? 0;
  const sanciones      = historial?.sanciones               ?? data?.sueldo?.sanciones               ?? 0;
  const horasFaltantes = historial?.horas_faltantes         ?? 0;
  const descuentoFalt  = horasFaltantes * precioHora;
  const totalPagar     = historial?.total_pagar             ?? data?.total_pagar                     ?? 0;

  const nombre  = historial?.username ?? data?.empleado?.username ?? "";
  const periodo = data ? `${data.periodo.inicio} → ${data.periodo.fin}` : "";
  const rangoComisiones = (historial?.comisiones_inicio && historial?.comisiones_fin)
    ? `Comisiones del ${fmtFecha(historial.comisiones_inicio)} – ${fmtFecha(historial.comisiones_fin)}`
    : null;

  // Fila normal
  const Fila = ({ label, value, color, bold }: {
    label: string; value: string; color?: string; bold?: boolean;
  }) => (
    <TableRow>
      <TableCell sx={{ color, fontWeight: bold ? "bold" : "normal", border: 0, py: 1 }}>
        {label}
      </TableCell>
      <TableCell align="right" sx={{ color, fontWeight: bold ? "bold" : "normal", border: 0, py: 1 }}>
        {value}
      </TableCell>
    </TableRow>
  );

  return (
    <Box maxWidth={520} mx="auto" p={2.5}>
      <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
        Mi Nómina
      </Typography>

      {nombre && (
        <Typography align="center" color="text.secondary" mb={rangoComisiones ? 0.5 : 2.5}>
          {nombre}{periodo ? ` · ${periodo}` : ""}
        </Typography>
      )}
      {rangoComisiones && (
        <Typography align="center" variant="body2" color="text.secondary" mb={2.5}>
          {rangoComisiones}
        </Typography>
      )}

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table size="small">
          <TableBody>

            {/* 1. Sueldo base */}
            <Fila label="Sueldo base" value={fmt(sueldoBase)} />

            <TableRow><TableCell colSpan={2} sx={{ p: 0 }}><Divider /></TableCell></TableRow>

            {/* 2. Comisiones */}
            {!nombre.startsWith("C") && <Fila label="Comisiones accesorios" value={fmt(comisAcc)} />}
            {!nombre.startsWith("C") && <Fila label="Comisiones teléfonos"  value={fmt(comisTel)} />}
            <Fila label={nombre.startsWith("C") ? "Comisión por activaciones" : "Comisiones chips"} value={fmt(comisChips)} />
            <Fila label="Total comisiones"       value={fmt(comisTotal)} bold />

            <TableRow><TableCell colSpan={2} sx={{ p: 0 }}><Divider /></TableCell></TableRow>

            {/* 3. Horas extra — solo asesores */}
            {esAsesor && <Fila label={`Horas extra (${horasExtra} hrs × $${precioHora})`} value={fmt(pagoHoras)} />}

            {esAsesor && <TableRow><TableCell colSpan={2} sx={{ p: 0 }}><Divider /></TableCell></TableRow>}

            {/* 4. Comisiones planes tarifarios / Bono Cheking */}
            <Fila label={nombre.startsWith("C") ? "Bono Cheking" : "Comisiones planes tarifarios"} value={fmt(comisPlanes)} />

            <TableRow><TableCell colSpan={2} sx={{ p: 0 }}><Divider /></TableCell></TableRow>

            {/* 5. Sanciones */}
            <Fila
              label="Sanciones"
              value={sanciones > 0 ? `-${fmt(sanciones)}` : fmt(0)}
              color={sanciones > 0 ? "error" : undefined}
            />

            {/* 6. Horas faltantes — solo asesores */}
            {esAsesor && (
              <Fila
                label="Horas faltantes"
                value={`${horasFaltantes} hrs`}
                color={horasFaltantes > 0 ? "error" : undefined}
              />
            )}

            {/* 7. Descuento hrs faltantes — solo asesores */}
            {esAsesor && (
              <Fila
                label="Descuento hrs faltantes"
                value={descuentoFalt > 0 ? `-${fmt(descuentoFalt)}` : fmt(0)}
                color={descuentoFalt > 0 ? "error" : undefined}
              />
            )}

            {/* 8. Total a pagar */}
            <TableRow sx={{ bgcolor: "#f97316" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", fontSize: 16, py: 1.5, border: 0 }}>
                Total a pagar
              </TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: "bold", fontSize: 16, py: 1.5, border: 0 }}>
                {fmt(totalPagar)}
              </TableCell>
            </TableRow>

            {/* 9. Fecha de pago */}
            <TableRow>
              <TableCell sx={{ color: "text.secondary", border: 0, py: 1 }}>
                📅 Fecha de pago
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", border: 0, py: 1 }}>
                {FECHA_PAGO_FIJA}
              </TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
