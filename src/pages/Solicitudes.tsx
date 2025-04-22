// supabase/functions/syncAirtableToInventario/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async () => {
  const AIRTABLE_BASE_ID = 'app7ns2Q5Hh3TZ3wu';
  const AIRTABLE_TABLE_NAME = 'Inventario';
  const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

  const response = await fetch(airtableUrl, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`
    }
  });

  const airtable = await response.json();

  const autos = airtable.records
    .filter((r: any) => r.fields.OrdenStatus === 'Comprado')
    .map((r: any) => ({
      ordencompra: r.fields.OrdenCompra,
      marca: r.fields.AutoMarca,
      modelo: r.fields.AutoSubmarcaVersion,
      año: r.fields.AutoAno,
      precio: r.fields.Precio,
      kilometraje: r.fields.Kilometraje,
      transmision: r.fields.AutoTransmision,
      numero_dueños: r.fields.NumeroDueños,
      carroceria: r.fields.ClasificacionID,
      descripcion: r.fields.Descripcion || '',
      ordenstatus: r.fields.OrdenStatus,
      estatus: 'Comprado',
      estado_revision: 'pendiente'
    }));

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/Inventario`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(autos)
  });

  if (!insertResponse.ok) {
    const error = await insertResponse.text();
    return new Response(`Error subiendo datos: ${error}`, { status: 500 });
  }

  return new Response(`✅ ${autos.length} autos sincronizados desde Airtable.`);
});
