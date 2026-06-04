import { companies, companyInfo } from './data.js';

const ALLOWED_ORIGINS = [
  'https://wiseandwisdom.net',
  'https://www.wiseandwisdom.net',
];

// ── RETENTION PERIODS (days) ──
const CONTACTS_RETENTION_DAYS = 365;
const DENUNCIAS_RETENTION_DAYS = 90;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function requireAuth(request, env) {
  return request.headers.get('x-api-key') === env.ADMIN_API_KEY;
}

async function sendEmail(env, { subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.FROM_EMAIL, to: env.TO_EMAIL, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  }
}

// ── GDPR RETENTION PURGE ──
async function runPurge(db) {
  const now = new Date().toISOString();
  const contactsCutoff = new Date(
    Date.now() - CONTACTS_RETENTION_DAYS * 86400000
  ).toISOString();
  const denunciasCutoff = new Date(
    Date.now() - DENUNCIAS_RETENTION_DAYS * 86400000
  ).toISOString();

  const cResult = await db
    .prepare('DELETE FROM contacts WHERE created_at < ?')
    .bind(contactsCutoff)
    .run();
  const dResult = await db
    .prepare('DELETE FROM denuncias WHERE created_at < ?')
    .bind(denunciasCutoff)
    .run();

  const contactsDeleted = cResult.meta?.changes ?? 0;
  const denunciasDeleted = dResult.meta?.changes ?? 0;

  await db
    .prepare('INSERT INTO purge_log (table_name, records_deleted, run_at) VALUES (?, ?, ?)')
    .bind('contacts', contactsDeleted, now)
    .run();
  await db
    .prepare('INSERT INTO purge_log (table_name, records_deleted, run_at) VALUES (?, ?, ?)')
    .bind('denuncias', denunciasDeleted, now)
    .run();

  return { contactsDeleted, denunciasDeleted };
}

async function logDeletion(db, tableName, recordId, reason) {
  await db
    .prepare(
      'INSERT INTO deletion_log (table_name, record_id, reason, deleted_at) VALUES (?, ?, ?, ?)'
    )
    .bind(tableName, String(recordId), reason, new Date().toISOString())
    .run();
}

// ── MAIN HANDLER ──
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    try {
      return await handleRequest(request, env, origin);
    } catch (err) {
      console.error('Unhandled worker error:', err?.message ?? err);
      return json({ message: 'Error interno del servidor' }, 500, origin);
    }
  },

  // ── DAILY CRON: 02:00 UTC ──
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runPurge(env.DB));
  },
};

async function handleRequest(request, env, origin) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── GET /api/info ──
    if (request.method === 'GET' && path === '/api/info') {
      return json(companyInfo, 200, origin);
    }

    // ── GET /api/companies ──
    if (request.method === 'GET' && path === '/api/companies') {
      return json(companies, 200, origin);
    }

    // ── POST /api/contact ──
    if (request.method === 'POST' && path === '/api/contact') {
      let body;
      try { body = await request.json(); } catch {
        return json({ message: 'Invalid JSON' }, 400, origin);
      }
      const { name, email, subject, message } = body;
      if (!name || !email || !message) {
        return json({ message: 'Faltan datos' }, 400, origin);
      }

      await env.DB.prepare(
        'INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(name, email, subject || '', message, new Date().toISOString())
        .run();

      try {
        await sendEmail(env, {
          subject: subject ? `Nuevo mensaje de ${name}: ${subject}` : `Nuevo mensaje de ${name}`,
          html: `<h3>Nuevo mensaje desde la web</h3>
            <p><b>Nombre:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            ${subject ? `<p><b>Asunto:</b> ${subject}</p>` : ''}
            <p><b>Mensaje:</b><br/>${message}</p>`,
        });
      } catch (err) {
        console.error('Email send failed (contact):', err.message);
      }

      return json({ message: 'Mensaje enviado correctamente' }, 200, origin);
    }

    // ── POST /api/denuncia ──
    if (request.method === 'POST' && path === '/api/denuncia') {
      let body;
      try { body = await request.json(); } catch {
        return json({ message: 'Invalid JSON' }, 400, origin);
      }
      const { tipo, empresa, descripcion, contacto } = body;
      if (!tipo || !descripcion) {
        return json({ message: 'Faltan datos obligatorios' }, 400, origin);
      }

      await env.DB.prepare(
        'INSERT INTO denuncias (tipo, empresa, descripcion, contacto, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(tipo, empresa || null, descripcion, contacto || null, new Date().toISOString())
        .run();

      try {
        await sendEmail(env, {
          subject: `Nueva denuncia: ${tipo}`,
          html: `<h3>Nueva denuncia recibida</h3>
            <p><b>Tipo:</b> ${tipo}</p>
            <p><b>Empresa:</b> ${empresa || 'No especificada'}</p>
            <p><b>Descripción:</b><br/>${descripcion}</p>
            <p><b>Contacto:</b> ${contacto || 'Anónimo'}</p>
            <hr/>
            <p style="color:gray;font-size:12px;">
              Recibido el ${new Date().toLocaleString('es-ES')} — Canal confidencial Wise &amp; Wisdom
            </p>`,
        });
      } catch (err) {
        console.error('Email send failed (denuncia):', err.message);
      }

      return json({ message: 'Denuncia registrada correctamente' }, 200, origin);
    }

    // ── ADMIN ROUTES ──
    if (path.startsWith('/api/admin/')) {
      if (!requireAuth(request, env)) {
        return json({ message: 'Unauthorized' }, 401, origin);
      }

      // GET /api/admin/contacts
      if (request.method === 'GET' && path === '/api/admin/contacts') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM contacts ORDER BY created_at DESC'
        ).all();
        return json(results, 200, origin);
      }

      // GET /api/admin/denuncias
      if (request.method === 'GET' && path === '/api/admin/denuncias') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM denuncias ORDER BY created_at DESC'
        ).all();
        return json(results, 200, origin);
      }

      // DELETE /api/admin/contacts/email/:email  (must be checked before /:id)
      const emailMatch = path.match(/^\/api\/admin\/contacts\/email\/(.+)$/);
      if (request.method === 'DELETE' && emailMatch) {
        const email = decodeURIComponent(emailMatch[1]);
        const { results: rows } = await env.DB.prepare(
          'SELECT id FROM contacts WHERE email = ?'
        ).bind(email).all();

        for (const row of rows) {
          await logDeletion(env.DB, 'contacts', row.id, 'Right to erasure by email (GDPR Art. 17)');
        }
        const del = await env.DB.prepare('DELETE FROM contacts WHERE email = ?').bind(email).run();
        return json({ deleted: del.meta?.changes ?? 0 }, 200, origin);
      }

      // DELETE /api/admin/contacts/:id
      const contactIdMatch = path.match(/^\/api\/admin\/contacts\/(\d+)$/);
      if (request.method === 'DELETE' && contactIdMatch) {
        const id = contactIdMatch[1];
        await logDeletion(env.DB, 'contacts', id, 'Right to erasure by ID (GDPR Art. 17)');
        await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
        return json({ deleted: true }, 200, origin);
      }

      // DELETE /api/admin/denuncias/:id
      const denunciaIdMatch = path.match(/^\/api\/admin\/denuncias\/(\d+)$/);
      if (request.method === 'DELETE' && denunciaIdMatch) {
        const id = denunciaIdMatch[1];
        await logDeletion(env.DB, 'denuncias', id, 'Right to erasure by ID (GDPR Art. 17)');
        await env.DB.prepare('DELETE FROM denuncias WHERE id = ?').bind(id).run();
        return json({ deleted: true }, 200, origin);
      }

      // POST /api/admin/purge
      if (request.method === 'POST' && path === '/api/admin/purge') {
        const result = await runPurge(env.DB);
        return json({ message: 'Purge complete', ...result }, 200, origin);
      }
    }

    return json({ message: 'Not found' }, 404, origin);
}
