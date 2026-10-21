# App de login con contenedores

Aplicación web con inicio de sesión validado contra PostgreSQL, desplegada con Docker.

## Arquitectura
Nginx (proxy) → Aplicación Node.js → PostgreSQL 17, en la red interna `red_interna`, con el volumen `datos_pg`. Solo Nginx publica el puerto 80.

## Requisitos
Docker y Docker Compose.

## Ejecutar en local
```bash
git clone [https://github.com/USUARIO/app-login-contenedores.git](https://github.com/USUARIO/app-login-contenedores.git)
cd app-login-contenedores
cp .env.example .env     # edite los valores
docker compose up -d --build
```
Abra http://localhost (o la URL del puerto 80 en Codespaces).

## Usuarios de prueba (ficticios)
- usuario1 / Clave123
- usuario2 / Clave456

## Imagen en Docker Hub
`gabdome/app-login:1.0.0` (linux/amd64)

## Detener sin perder datos
```bash
docker compose down
```
(No use `-v`, porque borra el volumen.)

## Seguridad
Contraseñas con hash bcrypt, consultas parametrizadas, secretos en `.env` fuera de Git, base de datos sin puerto público.
