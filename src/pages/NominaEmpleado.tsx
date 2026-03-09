import { useEffect, useState } from "react";
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

  if (loading) return <p style={{ textAlign: "center" }}>Cargando nómina...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return null;

  const { empleado, periodo, comisiones, sueldo, total_pagar } = data;

  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    marginBottom: 20,
  };

  const row = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "auto",
        fontFamily: "system-ui",
        padding: 20,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        💰 Mi Nómina
      </h2>

      {/* EMPLEADO */}
      <div style={card}>
        <h3>👤 Empleado</h3>
        <p>
          <b>{empleado.username}</b>
        </p>
        <p>
          Periodo: {periodo.inicio} → {periodo.fin}
        </p>
      </div>

      {/* COMISIONES */}
      <div style={card}>
        <h3>📊 Comisiones</h3>

        <div style={row}>
          <span>Accesorios</span>
          <b>${comisiones.accesorios}</b>
        </div>

        <div style={row}>
          <span>Teléfonos</span>
          <b>${comisiones.telefonos}</b>
        </div>

        <div style={row}>
          <span>Chips</span>
          <b>${comisiones.chips}</b>
        </div>

        <hr />

        <div style={{ ...row, fontSize: 18 }}>
          <b>Total comisiones</b>
          <b>${comisiones.total}</b>
        </div>
      </div>

      {/* SUELDO */}
      <div style={card}>
        <h3>💼 Sueldo</h3>

        <div style={row}>
          <span>Sueldo base</span>
          <b>${sueldo.base}</b>
        </div>

        <div style={row}>
          <span>Horas extra</span>
          <b>{sueldo.horas_extra}</b>
        </div>

        <div style={row}>
          <span>Pago horas extra</span>
          <b>${sueldo.pago_horas_extra}</b>
        </div>

        <div style={row}>
          <span>Sanciones</span>
          <b>-${sueldo?.sanciones ?? 0}</b>
        </div>

        <div style={row}>
          <span>Comisiones pendientes</span>
          <b>${sueldo?.comisiones_pendientes ?? 0}</b>
        </div>
      </div>

      {/* TOTAL */}
      <div
        style={{
          background: "#0f172a",
          color: "white",
          padding: 20,
          borderRadius: 12,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h2>Total a pagar</h2>
        <h1>${total_pagar}</h1>
      </div>

      {/* FECHA PAGO */}
      <div
        style={{
          background: "#e8f3ff",
          padding: 15,
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        📅 <b>Fecha de pago</b>
        <br />
        {fechaPagoFormateada}
      </div>
    </div>
  );
}