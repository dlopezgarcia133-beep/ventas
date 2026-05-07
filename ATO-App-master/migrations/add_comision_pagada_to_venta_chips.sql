-- Migración: agrega columna comision_pagada a venta_chips
-- Fecha: 2026-04-27
-- Ejecutar una sola vez en producción

ALTER TABLE venta_chips
    ADD COLUMN IF NOT EXISTS comision_pagada BOOLEAN NOT NULL DEFAULT FALSE;
