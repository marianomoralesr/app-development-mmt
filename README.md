# 🚗 App TREFA - Plataforma de Autos con Financiamiento y Venta

App TREFA es una plataforma web creada con React, TypeScript, Tailwind CSS y Supabase. Permite a usuarios vender autos o aplicar para financiamiento, con roles dinámicos y administración de solicitudes.

---

## 🧰 Tecnologías utilizadas

- **Frontend:** React + TypeScript
- **Estilos:** Tailwind CSS
- **Backend & Auth:** Supabase (Auth + DB + Storage)
- **Ruteo:** React Router DOM + AuthGuard
- **Sincronización:** Funciones Edge para Airtable y Google Sheets

---

## 🧩 Estructura de carpetas

```
/src
├── components
│   ├── autos, prestamo, layout, auth, etc.
├── pages
│   ├── Autos.tsx, MisAutos.tsx, MisSolicitudes.tsx
│   ├── admin/autos.tsx, admin/solicitudes.tsx
├── stores → authStore.ts
├── types → index.ts
├── lib → supabase.ts
```

---

## 👤 Roles y lógica de acceso

### En registro, se solicita el "Motivo del registro":

- **"Vender mi auto"** → Rol: `vendedor`
- **"Aplicar para financiamiento"** → Rol: `candidato`

Los roles se asignan automáticamente en la tabla `perfiles` y se usan para mostrar vistas diferentes.

### En login:

- Incluye link para **recuperar contraseña** vía Supabase
- No se requiere confirmación de email para ingresar actualmente (email confirmation disabled)

---

## 🛡 Rutas protegidas

| Ruta                 | Acceso           |
| -------------------- | ---------------- |
| `/autos`             | Público          |
| `/mis-autos`         | Rol: `vendedor`  |
| `/mis-solicitudes`   | Rol: `candidato` |
| `/admin/autos`       | Rol: `admin`     |
| `/admin/solicitudes` | Rol: `admin`     |

---

## 🔄 Sincronización automática

Funciones Edge incluidas para:

- `syncAirtableToInventario` → sincroniza Airtable con tabla `Inventario`
- `syncGoogleSheetsToAutos` → sincroniza Google Sheets con tabla `autos`

Se pueden ejecutar con cron jobs o manualmente vía endpoint.

---

## ⚙️ Instalación y deploy

1. Clona el proyecto
2. Crea `.env` con:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

3. Instala dependencias:

```bash
npm install
```

4. Ejecuta local:

```bash
npm run dev
```

5. Para producción (ej. Vercel):

```bash
vercel --prod
```

---

## ⏱ Cron jobs sugeridos

Usamos  [Supabase Edge Tasks](https://supabase.com/docs/guides/functions/schedule-functions) o Vercel Scheduler:

### Airtable Sync (cada 15 min):

```bash
curl -X POST https://apptrefa.functions.supabase.co/syncAirtableToInventario
```

### Google Sheets Sync (cada 15 min):

```bash
curl -X POST https://apptrefa.functions.supabase.co/syncGoogleSheetsToAutos
```

---

## 🧪 Tests y Validaciones

- Validación de sesión y rol en cada ruta
- Manejo de errores y respuestas del servidor
- Merge automático en Supabase vía `Prefer: resolution=merge-duplicates`

---
