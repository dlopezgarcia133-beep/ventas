import { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, CircularProgress } from "@mui/material";
import { MiNominaResponse } from "../Types";

export default function NominaEmpleado() {
  const [data, setData] = useState<MiNominaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const hoy = new Date();
  const diaSemana = hoy.getDay();

  let diasHastaMiercoles;
  if (diaSemana <= 3) {
    diasHastaMiercoles = 3 - diaSemana;
  } else {
    diasHastaMiercoles = 7 - diaSemana + 3;
  }

  const fechaPago = new Date(hoy);
  fechaPago.setDate(hoy.getDate() + diasHastaMiercoles);

  const fechaPagoFormateada = fechaPago.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const cargarNomina = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-resumen`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("Error al obtener la nómina");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("No se pudo cargar la nómina");
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
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;
  if (!data) return null;

  const { empleado, periodo, comisiones, sueldo, total_pagar } = data;

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

      {/* EMPLEADO */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>👤 Empleado</Typography>
        <Typography fontWeight="bold">{empleado.username}</Typography>
        <Typography variant="body2" color="text.secondary">
          Periodo: {periodo.inicio} → {periodo.fin}
        </Typography>
      </Paper>

      {/* COMISIONES */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>📊 Comisiones</Typography>
        <Row label="Accesorios" value={`$${comisiones.accesorios}`} />
        <Row label="Teléfonos" value={`$${comisiones.telefonos}`} />
        <Row label="Chips" value={`$${comisiones.chips}`} />
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold" fontSize={16}>Total comisiones</Typography>
          <Typography fontWeight="bold" fontSize={16}>${comisiones.total}</Typography>
        </Box>
      </Paper>

      {/* SUELDO */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>💼 Sueldo</Typography>
        <Row label="Sueldo base" value={`$${sueldo.base}`} />
        <Row label="Horas extra" value={sueldo.horas_extra} />
        <Row label="Pago horas extra" value={`$${sueldo.pago_horas_extra}`} />
        <Row label="Sanciones" value={`-$${sueldo?.sanciones ?? 0}`} />
        <Row label="Comisiones pendientes" value={`$${sueldo?.comisiones_pendientes ?? 0}`} />
      </Paper>

      {/* TOTAL */}
      <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 3, bgcolor: "#f97316", color: "white", textAlign: "center" }}>
        <Typography variant="h6">Total a pagar</Typography>
        <Typography variant="h4" fontWeight="bold">${total_pagar}</Typography>
      </Paper>

      {/* FECHA PAGO */}
      <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#fff7ed", border: "1px solid rgba(249,115,22,0.25)", textAlign: "center" }}>
        <Typography>
          📅 <strong>Fecha de pago</strong>
          <br />
          {fechaPagoFormateada}
        </Typography>
      </Paper>
    </Box>
  );
}
