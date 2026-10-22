const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
app.use('/assets', express.static(require('path').join(__dirname, 'public')));
app.set('trust proxy', 1);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto' }
}));

const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const page = body => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inicio de sesión | App Login</title>
  <link rel="stylesheet" href="/assets/estilos.css">
</head>
<body>${body}</body>
</html>`;

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  const error = req.query.error ? '<p class="login-error" role="alert">Usuario o contraseña incorrectos.</p>' : '';
  res.send(page(`
    <main class="auth-card">
      <section class="illustration-area">
        <img
          class="login-illustration"
          src="/assets/imagenes/login.png"
          alt=""
          decoding="async"
        >
        <p class="art-caption">Tu espacio, <strong>siempre protegido.</strong></p>
      </section>
      <section class="login-panel">
        <div class="brand-symbol" aria-hidden="true">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="2"/>
            <path d="M7 10V7a5 5 0 0 1 10 0v3"/>
          </svg>
        </div>
        <p class="eyebrow">BIENVENIDO</p>
        <h1>Inicio de sesión</h1>
        <p class="intro">Ingresa tus credenciales para continuar.</p>
        ${error}
        <form class="login-form" method="post" action="/login">
          <label for="usuario">Usuario</label>
          <div class="input-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>
            <input id="usuario" name="usuario" type="text" placeholder="Ingresa tu usuario" autocomplete="username" required autofocus>
          </div>
          <label for="clave">Contraseña</label>
          <div class="input-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>
            <input id="clave" name="clave" type="password" placeholder="Ingresa tu contraseña" autocomplete="current-password" required>
          </div>
          <button type="submit" class="primary-button">Iniciar sesión</button>
        </form>
        <p class="security-note">Acceso protegido mediante credenciales</p>
      </section>
    </main>
  `));
});

app.post('/login', async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    const r = await pool.query(
      'SELECT nombre, password_hash FROM users WHERE username = $1', [usuario]);
    if (r.rows.length && await bcrypt.compare(clave, r.rows[0].password_hash)) {
      req.session.nombre = r.rows[0].nombre;
      return res.redirect('/bienvenida');
    }
    res.redirect('/login?error=1');
  } catch (e) {
    console.error(e);
    res.status(500).send(page('<p>Error interno</p>'));
  }
});

app.get('/bienvenida', (req, res) => {
  if (!req.session.nombre) return res.redirect('/login');
  res.send(page(`<main class="welcome-card"><div class="brand-symbol" aria-hidden="true">
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="4" y="10" width="16" height="11" rx="2"/>
    <path d="M7 10V7a5 5 0 0 1 10 0v3"/>
  </svg>
</div>
<p class="eyebrow">SESIÓN INICIADA</p><h1>Bienvenido, ${esc(req.session.nombre)}</h1><p>Has ingresado correctamente a tu cuenta.</p><a class="primary-button logout-button" href="/logout">Cerrar sesión</a></main>`));
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('App lista'));

(async () => {
  for (let i = 0; i < 30; i++) {
    try {
      await pool.query(fs.readFileSync(__dirname + '/init.sql', 'utf8'));
      console.log('Base de datos inicializada');
      break;
    } catch (e) {
      console.log('Esperando la base de datos...', e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
})();