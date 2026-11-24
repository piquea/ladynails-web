-- =============================================================
--  LADY NAILS WEB — Esquema de base de datos (Supabase)
--  Proyecto: ladynails-web (organización Lady Nails, plan Free) — ya aplicado el 23/11/2026
--  Cómo usarlo en un proyecto nuevo: Supabase → SQL Editor → New query → pegar todo → Run
-- =============================================================

create table if not exists reservas (
  id               bigint generated always as identity primary key,
  codigo           text unique not null,            -- LN-261123-AB12
  creado_en        timestamptz not null default now(),
  estado           text not null default 'por_validar',
      -- por_validar (subió constancia) | confirmada | atendida | anulada
  cliente_nombre   text not null,
  cliente_celular  text not null,
  cliente_email    text,
  primera_vez      boolean not null default true,
  fecha            date not null,
  hora_inicio      time not null,
  hora_fin         time not null,
  duracion_min     int  not null,
  items            jsonb not null,                  -- [{codigo, nombre, precio, duracion}]
  total            numeric(10,2) not null,
  abono            numeric(10,2) not null,
  saldo            numeric(10,2) not null,
  metodo_pago      text not null,                   -- yape | plin | transferencia
  constancia       text,                            -- ruta en el bucket privado "constancias"
  notas            text,
  acepto_politicas_en timestamptz not null default now()
);

create index if not exists reservas_fecha on reservas (fecha) where estado <> 'anulada';

-- Bloquear un día completo (hora_inicio = null) o un rango, quitando "cupos" manicuristas
create table if not exists bloqueos_agenda (
  id          bigint generated always as identity primary key,
  fecha       date not null,
  hora_inicio time,
  hora_fin    time,
  cupos       int not null default 3,               -- 3 = nadie atiende; 1 = falta una manicurista
  motivo      text
);
create index if not exists bloqueos_fecha on bloqueos_agenda (fecha);

-- Seguridad: nadie desde el navegador puede leer ni escribir; solo el servidor de la web.
alter table reservas        enable row level security;
alter table bloqueos_agenda enable row level security;

-- Bucket privado para las constancias de pago
insert into storage.buckets (id, name, public, file_size_limit) values ('constancias', 'constancias', false, 5242880)
on conflict (id) do nothing;
