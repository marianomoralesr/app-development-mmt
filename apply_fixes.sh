#!/usr/bin/env bash
set -euo pipefail

echo "💡 Applying Supabase & Auth fixes…"

# 1) File patches (unchanged from before)
# — remove Database generic, fix login.tsx, fix register.tsx, fix FormularioAuto.tsx
# (omitted here for brevity; assume you’ve already got that block)

# 2) Make sure supabase CLI is linked to your project
if ! supabase status --project-ref ioewyambpjlqnsbzvbvd >/dev/null 2>&1; then
  echo "🔗 Linking supabase CLI to project ioewyambpjlqnsbzvbvd…"
  supabase link --project-ref ioewyambpjlqnsbzvbvd
fi

# 3) Ensure the 'candidato' role exists
echo "✅ Ensuring 'candidato' role exists…"
supabase db psql <<SQL
INSERT INTO public.roles (nombre)
VALUES ('candidato')
ON CONFLICT (nombre) DO NOTHING;
SQL

# 4) Drop the old auth trigger and function
echo "🔨 Dropping handle_new_user trigger and function…"
supabase db psql <<SQL
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
SQL

echo "🎉 Done! Restart your dev server and test registration again."