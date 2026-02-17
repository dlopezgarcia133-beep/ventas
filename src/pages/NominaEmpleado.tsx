import { useEffect, useState } from "react";
import { MiNominaResponse } from "../Types";


export default function NominaEmpleado() {
  const [data, setData] = useState<MiNominaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");


  const hoy = new Date();
const diaSemana = hoy.getDay(); // 0=Domingo, 1=Lunes ... 3=Miércoles

let diasHastaMiercoles;

if (diaSemana <= 3) {
  // Si estamos antes o en miércoles
  diasHastaMiercoles = 3 - diaSemana;
} else {
  // Si ya pasó miércoles, ir al siguiente
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

  if (loading) return <p>Cargando nómina...</p>;
  if (error) return <p>{error}</p>;
  if (!data) return null;

  const { empleado, periodo, comisiones, sueldo, total_pagar } = data;

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Nómina</h2>

      <p><b>Empleado:</b> {empleado.username}</p>
      <p><b>Periodo:</b> {periodo.inicio} → {periodo.fin}</p>

      <hr />

      <h3>Comisiones</h3>
      <p>Accesorios: ${comisiones.accesorios}</p>
      <p>Teléfonos: ${comisiones.telefonos}</p>
      <p>Chips: ${comisiones.chips}</p>
      <p><b>Total comisiones: ${comisiones.total}</b></p>

      <hr />

      <h3>Sueldo</h3>
      <p>Sueldo base: ${sueldo.base}</p>
      <p>Horas extra: {sueldo.horas_extra}</p>
      <p>Pago horas extra: ${sueldo.pago_horas_extra}</p>

      <hr />

      <h2>Total a pagar: ${total_pagar}</h2>

      <div style={{
        marginTop: 15,
        padding: 10,
        background: "#eef6ff",
        borderRadius: 8
      }}>
        📅 <b>Fecha de pago:</b> {fechaPagoFormateada}
      </div>

    </div>
  );
}