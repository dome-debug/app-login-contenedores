CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL
);

INSERT INTO users (username, password_hash, nombre) VALUES
  ('usuario1', '$2a$10$sVRLXQDp6ojOpchWLphydOetsr2LI3f40SBbVokpIac.I/VxaiHNW', 'Ana Ficticia'),
  ('usuario2', '$2a$10$FHRYU/54EuS8IvNWqbqAMeIlrNX20mDY7v0HIzOBXbYiXUEYL1ZRW', 'Luis Ficticio')
ON CONFLICT (username) DO NOTHING;