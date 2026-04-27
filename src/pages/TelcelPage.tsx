import React, { useState, useRef } from "react";
import {
  Box, Typography, Paper, Button, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Alert, CircularProgress,
  Divider, Chip,
} from "@mui/material";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL  || "";
const supabaseKey  = process.env.REACT_APP_SUPABASE_ANON_KEY || "";
const supabase     = createClient(supabaseUrl, supabaseKey);

interface FilaComision {
  numero: string;
  cadena: string;
  fecha: string;
  comision_telcel: number;
}

const COLS = ["numero", "cadena", "fecha", "comision_telcel"];

const pick = (row: any, key: string): string =>
  String(
    row[key] ??
    row[key.charAt(0).toUpperCase() + key.slice(1)] ??
    row[key.toUpperCase()] ??
    ""
  );

const TelcelPage = () => {
  const [filas, setFilas]           = useState<FilaComision[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [guardando, setGuardando]   = useState(false);
  const [mensaje, setMensaje]       = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMensaje(null);
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
          fecha:           pick(row, "fecha"),
          comision_telcel: Number(pick(row, "comision_telcel")) || 0,
        }))
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const guardar = async () => {
    if (!filas.length) return;
    setGuardando(true);
    setMensaje(null);

    try {
      const { error } = await supabase.from("comisiones_telcel").insert(filas);

      if (error) {
        if (error.code === "42P01") {
          setMensaje({
            tipo: "error",
            texto:
              'La tabla "comisiones_telcel" no existe. Ejecútala en el SQL Editor de Supabase:\n\n' +
              CREATE_TABLE_SQL,
          });
        } else {
          setMensaje({ tipo: "error", texto: `Error al guardar: ${error.message}` });
        }
      } else {
        setMensaje({
          tipo: "success",
          texto: `${filas.length} registro${filas.length !== 1 ? "s" : ""} guardado${filas.length !== 1 ? "s" : ""} correctamente.`,
        });
        setFilas([]);
        setNombreArchivo("");
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err: any) {
      setMensaje({ tipo: "error", texto: `Error inesperado: ${err.message}` });
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
            Seleccionar archivo Excel
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

      {/* Preview table */}
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
              startIcon={
                guardando
                  ? <CircularProgress size={16} color="inherit" />
                  : <SaveIcon />
              }
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

          <Box
            sx={{
              px: 3, py: 1.5,
              borderTop: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total comisión:{" "}
              <strong style={{ color: "#16a34a" }}>${totalComision.toFixed(2)}</strong>
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Result alert */}
      {mensaje && (
        <Alert
          severity={mensaje.tipo}
          icon={mensaje.tipo === "success" ? <CheckCircleIcon /> : undefined}
          sx={{ mb: 3, whiteSpace: "pre-wrap" }}
        >
          {mensaje.texto}
        </Alert>
      )}

      {/* SQL reference card */}
      <Paper sx={{ p: 3, bgcolor: "#f8fafc" }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "#0d1e3a" }}>
          SQL para crear la tabla en Supabase
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Box
          component="pre"
          sx={{
            fontSize: 12,
            color: "#1e293b",
            bgcolor: "#f1f5f9",
            borderRadius: 1,
            p: 2,
            overflowX: "auto",
            border: "1px solid #e2e8f0",
            m: 0,
          }}
        >
          {CREATE_TABLE_SQL}
        </Box>
      </Paper>
    </Box>
  );
};

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS comisiones_telcel (
  id              bigint generated always as identity primary key,
  numero          text,
  cadena          text,
  fecha           date,
  comision_telcel numeric,
  created_at      timestamptz default now()
);`;

export default TelcelPage;
