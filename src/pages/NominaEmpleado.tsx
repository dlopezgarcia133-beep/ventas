import { useEffect, useState } from "react";
import { MiNominaResponse } from "@/types/nomina";

export default function NominaEmpleado() {
  const [data, setData] = useState<MiNominaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarNomina = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/nomina/mi-resumen`,
          {
            credentials: "include",
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
    </div>
  );
}