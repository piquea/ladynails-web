# Lady Nails Studio — web

Landing + reservas en línea con abono (Yape, Plin o transferencia con constancia).

## Panel interno — `/panel`

Entra con la clave de la variable `ADMIN_CLAVE` (Netlify). Ahí se maneja todo sin tocar código:

- **Reservas:** ver las citas por fecha, abrir la constancia, confirmar el abono, avisar por WhatsApp, marcar atendida o anular.
- **Bloqueos de agenda:** feriados, capacitaciones o cuando falta una manicurista.
- **Libro de reclamaciones:** hojas recibidas, días hábiles transcurridos (plazo 15) y respuesta.
- **Contenido de la web:** precios y servicios, textos de portada, horario, agenda, abono, métodos de pago, políticas y contacto.

Los valores iniciales están en `src/config/negocio.ts` y `src/data/servicios.json`; lo que se guarda en el panel los reemplaza.

## Actualizar precios desde el Excel

```
python3 scripts/convertir_servicios.py SERVICIOS_LADY_NAILS_2026.xlsx
```
Usa la hoja **"Servicios"**; los códigos (MNC001, PCK001…) son los mismos del punto de venta.

## Piezas

- **Next.js** — la web
- **Supabase** — guarda las reservas y las constancias (`supabase/esquema.sql`)
- **Netlify** — publica la web (variables `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_CLAVE`)
- **GitHub** — guarda el código

