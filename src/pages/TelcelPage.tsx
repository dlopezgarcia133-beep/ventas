import React, { useState, useRef } from "react";
import {
  Box, Typography, Paper, Button, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Alert, CircularProgress, Chip, Grid,
} from "@mui/material";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TagIcon from "@mui/icons-material/Tag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL  || "";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
};

interface FilaComision {
  numero: string;
  cadena: string;
  fecha: string;
  comision_telcel: number;
}

interface Resumen {
  totalRegistros: number;
  totalComision: number;
  fechaMin: string;
  fechaMax: string;
}

const COLS = ["numero", "cadena", "fecha", "comision_telcel"];

const pickRaw = (row: any, key: string): any => {
  const match = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
  return match !== undefined ? row[match] : "";
};

const pick = (row: any, key: string): string => String(pickRaw(row, key) ?? "");

const excelDateToJS = (serial: number): string => {
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date.toISOString().split("T")[0];
};

const parseFecha = (raw: any): string => {
  if (typeof raw === "number") return excelDateToJS(raw);
  return String(raw ?? "");
};

const calcResumen = (filas: FilaComision[]): Resumen => {
  const fechas = filas.map((f) => f.fecha).filter(Boolean).sort();
  return {
    totalRegistros: filas.length,
    totalComision:  filas.reduce((s, f) => s + Number(f.comision_telcel), 0),
    fechaMin: fechas[0] ?? "—",
    fechaMax: fechas[fechas.length - 1] ?? "—",
  };
};

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS comisiones_telcel (
  id              bigint generated always as identity primary key,
  numero          text,
  cadena          text,
  fecha           date,
  comision_telcel numeric,
  created_at      timestamptz default now()
);`;

/* ─── Tarjeta de resumen ─── */
const StatCard = ({
  icon, label, value, sub,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) => (
  <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 0.5 }}>
    <Box display="flex" alignItems="center" gap={1} sx={{ color: "#64748b", mb: 0.5 }}>
      {icon}
      <Typography variant="caption" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="h4" fontWeight={800} sx={{ color: "#f97316", lineHeight: 1 }}>
      {value}
    </Typography>
    {sub && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {sub}
      </Typography>
    )}
  </Paper>
);

/* ─── Página principal ─── */
const TelcelPage = () => {
  const [filas, setFilas]             = useState<FilaComision[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [resumen, setResumen]         = useState<Resumen | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setResumen(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setNombreArchivo(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb  = XLSX.read(ev.target?.result, { type: "array" });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      setFilas(
        raw.map((row) => ({
          numero:          pick(row, "numero"),
          cadena:          pick(row, "cadena"),
          fecha:           parseFecha(pickRaw(row, "fecha")),
          comision_telcel: Number(pick(row, "comision_telcel")) || 0,
        }))
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const guardar = async () => {
    if (!filas.length) return;
    const sb = getSupabase();
    if (!sb) return;
    setGuardando(true);
    setErrorMsg(null);

    try {
      const { error } = await sb.from("comisiones_telcel").insert(filas);

      if (error) {
        setErrorMsg(
          error.code === "42P01"
            ? `La tabla "comisiones_telcel" no existe. Ejecútala en el SQL Editor de Supabase:\n\n${CREATE_TABLE_SQL}`
            : `Error al guardar: ${error.message}`
        );
      } else {
        setResumen(calcResumen(filas));
        setFilas([]);
        setNombreArchivo("");
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err: any) {
      setErrorMsg(`Error inesperado: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const totalComision = filas.reduce((s, f) => s + Number(f.comision_telcel), 0);
  const supabaseOk    = Boolean(supabaseUrl && supabaseKey);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, color: "#0d1e3a" }}>
        Comisiones TELCEL
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sube un archivo Excel con columnas:{" "}
        {COLS.map((c) => (
          <Chip
            key={c}
            label={c}
            size="small"
            sx={{ mr: 0.5, bgcolor: "rgba(249,115,22,0.1)", color: "#ea6c00", fontWeight: 600, fontSize: 11 }}
          />
        ))}
      </Typography>

      {/* Upload */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => inputRef.current?.click()}
            sx={{ bgcolor: "#0d1e3a", "&:hover": { bgcolor: "#1e3a5f" } }}
          >
            {resumen ? "Subir otro archivo" : "Seleccionar archivo Excel"}
          </Button>
          {nombreArchivo && (
            <Chip
              label={nombreArchivo}
              sx={{ bgcolor: "rgba(249,115,22,0.1)", color: "#ea6c00", fontWeight: 600 }}
            />
          )}
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          onChange={handleArchivo}
        />
      </Paper>

      {/* Supabase config warning */}
      {!supabaseOk && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Configura <strong>REACT_APP_SUPABASE_URL</strong> y{" "}
          <strong>REACT_APP_SUPABASE_ANON_KEY</strong> en tu archivo{" "}
          <code>.env</code> para habilitar el guardado.
        </Alert>
      )}

      {/* Error */}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
          {errorMsg}
        </Alert>
      )}

      {/* ── ESTADO: guardado exitoso → tarjetas de resumen ── */}
      {resumen && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <CheckCircleIcon sx={{ color: "#22c55e" }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#22c55e" }}>
              Guardado correctamente
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<TagIcon fontSize="small" />}
                label="Total registros"
                value={resumen.totalRegistros.toLocaleString("es-MX")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<AttachMoneyIcon fontSize="small" />}
                label="Total comisión"
                value={`$${resumen.totalComision.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<CalendarMonthIcon fontSize="small" />}
                label="Período"
                value={resumen.fechaMin === resumen.fechaMax ? resumen.fechaMin : resumen.fechaMin}
                sub={resumen.fechaMin !== resumen.fechaMax ? `hasta ${resumen.fechaMax}` : undefined}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── ESTADO: archivo cargado → vista previa ── */}
      {filas.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Box
            sx={{
              px: 3, py: 2,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Vista previa — {filas.length} registros
            </Typography>
            <Button
              variant="contained"
              startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={guardando || !supabaseOk}
              onClick={guardar}
            >
              {guardando ? "Guardando…" : "Guardar en base de datos"}
            </Button>
          </Box>

          <TableContainer sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Cadena</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Comisión Telcel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ color: "#94a3b8", fontSize: 12 }}>{i + 1}</TableCell>
                    <TableCell>{f.numero}</TableCell>
                    <TableCell>{f.cadena}</TableCell>
                    <TableCell>{f.fecha}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "#16a34a" }}>
                      ${Number(f.comision_telcel).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ px: 3, py: 1.5, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="body2" color="text.secondary">
              Total comisión:{" "}
              <strong style={{ color: "#16a34a" }}>${totalComision.toFixed(2)}</strong>
            </Typography>
          </Box>
        </Paper>
      )}

      {/* SQL reference — solo visible antes de guardar */}
      {!resumen && (
        <Paper sx={{ p: 3, bgcolor: "#f8fafc" }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "#0d1e3a" }}>
            SQL para crear la tabla en Supabase
          </Typography>
          <Box
            component="pre"
            sx={{
              fontSize: 12, color: "#1e293b", bgcolor: "#f1f5f9",
              borderRadius: 1, p: 2, overflowX: "auto",
              border: "1px solid #e2e8f0", m: 0,
            }}
          >
            {CREATE_TABLE_SQL}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default TelcelPage;
