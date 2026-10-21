CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  nombre VARCHAR(100) NOT NULL
);
INSERT INTO users (username, password_hash, nombre) VALUES
  ('usuario1', '$2a$10$WhfLwYJPLXI72XfpWorck.OjOnv9hsaw6mlcV3h/dSaF3/y8qHYNe', 'Ana Ficticia'),
  ('usuario2', '$2a$10$RgHL8AqfA.FGDGIKRI5ifOaphokjKN7orxIlraXogckuQSfERm9P.', 'Luis Ficticio')
ON CONFLICT (username) DO NOTHING;
