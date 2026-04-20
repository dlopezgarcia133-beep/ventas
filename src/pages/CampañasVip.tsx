
import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface Cliente {
  nombre: string;
  telefono: string;
}

const CampañasVIP() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mensaje, setMensaje] = useState(
    "Hola {nombre}, 🎉 tienes una promoción especial"
  );

  useEffect(() => {
    fetch("/api/clientes_vip")
      .then(res => res.json())
      .then(data => setClientes(data));
  }, []);

  const generarLink = (telefono: string, nombre: string) => {
    const mensajePersonalizado = mensaje.replace("{nombre}", nombre);

    const mensajeCodificado = encodeURIComponent(mensajePersonalizado);

    return `https://wa.me/${telefono}?text=${mensajeCodificado}`;
  };

  return (
    <Box p={2}>
      {/* INPUT MENSAJE */}
      <TextField
        fullWidth
        label="Mensaje de campaña"
        multiline
        rows={3}
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />

      {/* TABLA */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {clientes.map((cliente, index) => (
            <TableRow key={index}>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    window.open(
                      generarLink(cliente.telefono, cliente.nombre),
                      "_blank"
                    )
                  }
                >
                  Enviar WhatsApp
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}


export default CampañasVip()
