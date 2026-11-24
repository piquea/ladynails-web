# Lady Nails Studio — web

Landing + reservas en línea con abono (Yape, Plin o transferencia con constancia).

## Qué editar sin saber programar

| Quiero cambiar…                                 | Archivo |
|-------------------------------------------------|---------|
| WhatsApp, Instagram, dirección                  | `src/config/negocio.ts` → `NEGOCIO` |
| Horario de atención, días cerrados              | `src/config/negocio.ts` → `HORARIO`, `AGENDA.fechasBloqueadas` |
| Cuántas citas a la vez (manicuristas)           | `src/config/negocio.ts` → `AGENDA.manicuristas` |
| % del abono                                     | `src/config/negocio.ts` → `ABONO` |
| Números de Yape / Plin / cuentas                | `src/config/negocio.ts` → `DATOS_PAGO` |
| Políticas de reserva                            | `src/config/negocio.ts` → `POLITICAS` |
| Textos de los sistemas (Rubber, Builder…)       | `src/data/sistemas.ts` |
| Precios y servicios                             | `src/data/servicios.json` (se genera desde el Excel) |
| Fotos                                           | `public/fotos/` |

En GitHub: abre el archivo → lápiz ✏️ → edita → **Commit changes**. Netlify publica solo en ~2 minutos.

## Actualizar precios desde el Excel

```
python3 scripts/convertir_servicios.py SERVICIOS_LADY_NAILS_2026.xlsx
```
Usa la hoja **"Servicios"**; los códigos (MNC001, PCK001…) son los mismos del punto de venta.

## Piezas

- **Next.js** — la web
- **Supabase** — guarda las reservas y las constancias (`supabase/esquema.sql`)
- **Netlify** — publica la web (variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`)
- **GitHub** — guarda el código

## Bloquear horas

En Supabase → Table editor → `bloqueos_agenda`: agrega una fila con la fecha.
Sin horas = todo el día. `cupos` = cuántas manicuristas faltan (3 = nadie atiende).
