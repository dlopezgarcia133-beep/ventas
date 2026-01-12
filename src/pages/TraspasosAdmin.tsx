import React, { useEffect, useState } from "react";
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Button, TextField, Box
} from "@mui/material";
import axios from "axios";
import { Traspaso } from "../Types";

const TraspasosAdmin = () => {
  const [traspasos, setTraspasos] = useState<Traspaso[]>([]);
  const [folios, setFolios] = useState<Record<number, string>>({});


  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const cargarTraspasos = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/traspasos/traspasos`,
    config
  )
  setTraspasos(res.data)
}


const actualizarEstado = async (
  id: number,
  estado: "aprobado" | "rechazado",
  folio?: string
) => {
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/traspasos/traspasos/${id}`,
      {
        estado,
        ...(estado === "aprobado" && { folio }) // 👈 solo si aplica
      },
      config
    );

    cargarTraspasos();
  } catch (err: any) {
    alert(err.response?.data?.detail || "Error al actualizar traspaso");
  }
};


  const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  })
}


  useEffect(() => {
    cargarTraspasos();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Solicitudes de Traspaso</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Folio Autorización</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
              <TableCell>Capturado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {traspasos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.producto}</TableCell>
                <TableCell>{t.cantidad}</TableCell>
                <TableCell>{t.modulo_origen}</TableCell>
                <TableCell>{t.modulo_destino}</TableCell>
                <TableCell>
                  <TextField
                    label="Folio de autorización"
                    value={folios[t.id] || ""}
                    onChange={(e) =>
                      setFolios(prev => ({
                        ...prev,
                        [t.id]: e.target.value
                      }))
                    }
                    size="small"
                    fullWidth
                  />
                </TableCell>


                <TableCell>{t.estado}</TableCell>
                <TableCell>{formatearFecha(t.fecha)}</TableCell>

                <TableCell>
                  {t.estado === "pendiente" ? (
                    <>
                      <Button
                        color="success"
                        onClick={() => {
                          const folio = folios[t.id];

                          if (!folio?.trim()) {
                            alert("Debes ingresar el folio de autorización");
                            return;
                          }

                          actualizarEstado(t.id, "aprobado", folio);
                        }}
                      >
                        Aprobar
                      </Button>

                      <Button
                        color="error"
                        onClick={() => actualizarEstado(t.id, "rechazado")}
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell>
                  <input
                    type="checkbox"
                    title="Marcar como capturado"
                    onChange={async () => {
                      await axios.put(
                        `${process.env.REACT_APP_API_URL}/traspasos/traspasos/${t.id}/ocultar`,
                        {},
                        config
                      )

                      // quitarlo de la tabla
                      setTraspasos(prev =>
                        prev.filter(item => item.id !== t.id)
                      )
                    }}
                  />
                </TableCell>


              </TableRow>
            ))}
            {traspasos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay solicitudes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TraspasosAdmin;
