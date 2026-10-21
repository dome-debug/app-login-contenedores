const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
app.set('trust proxy', 1);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto' }
}));

const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const page = body => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>App Login</title></head><body style="font-family:sans-serif;max-width:360px;margin:60px auto;padding:0 16px">${body}</body></html>`;

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  const error = req.query.error ? '<p style="color:#b42318">Credenciales inválidas</p>' : '';
  res.send(page(`<h2>Iniciar sesión</h2>${error}<form method="post" action="/login"><input name="usuario" placeholder="Usuario" required><br><br><input name="clave" type="password" placeholder="Contraseña" required><br><br><button type="submit">Entrar</button></form>`));
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
  res.send(page(`<h2>Bienvenido, ${esc(req.session.nombre)}</h2><a href="/logout">Cerrar sesión</a>`));
});

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

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
  app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('App lista'));
})();
