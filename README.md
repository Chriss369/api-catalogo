# API Catálogo y Favoritos

API REST con Node.js, Express y PostgreSQL para gestionar un catálogo de productos y los favoritos personales de cada usuario, con autenticación JWT y autorización por roles.

## Integrantes

- Christopher Aguiño (GitHub: [Chriss369](https://github.com/Chriss369)) — trabajo individual

## Propósito

- Consulta pública del catálogo de productos, con filtro por categoría.
- Gestión del catálogo (crear, actualizar, eliminar) solo para el administrador.
- Registro e inicio de sesión de usuarios, con JWT con vencimiento.
- Favoritos personales: cada usuario solo ve y modifica los suyos.

## Elección de base de datos: PostgreSQL

Se eligió PostgreSQL porque la relación usuario - producto - favorito se garantiza con restricciones del propio motor:

- `UNIQUE (correo)` en usuarios: correo único.
- `CHECK (precio > 0)` en productos: precio mayor que cero.
- `UNIQUE (usuario_id, producto_id)` en favoritos: sin duplicados.
- `ON DELETE CASCADE` en las claves foráneas de favoritos: al eliminar un producto (o un usuario), sus favoritos se eliminan automáticamente y no quedan referencias huérfanas.

Todas las consultas están parametrizadas (`$1`, `$2`...), sin concatenar datos del cliente en el SQL.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior (y opcionalmente pgAdmin 4)
- Postman (para las pruebas)
- Git

## Instalación

```bash
git clone https://github.com/Chriss369/api-catalogo.git
cd api-catalogo
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores reales (el archivo `.env` no se sube al repositorio).

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `JWT_SECRET` | Secreto para firmar los tokens (usa una frase larga y aleatoria) |
| `JWT_EXPIRES_IN` | Vigencia del token, por ejemplo `1h` |
| `DATABASE_URL` | `postgresql://usuario:clave@localhost:5432/catalogo` |
| `ADMIN_NOMBRE` | Nombre del administrador inicial |
| `ADMIN_EMAIL` | Correo del administrador inicial |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial |

## Inicialización de datos y del administrador

Con PostgreSQL encendido y el `.env` configurado:

```bash
npm run db:init
npm run admin:crear
```

- `db:init` crea la base `catalogo` si no existe, crea las tablas (`sql/schema.sql`) e inserta 5 productos de ejemplo (solo si la tabla está vacía).
- `admin:crear` crea (o actualiza) el usuario administrador con los datos `ADMIN_*` del `.env`. El rol `admin` solo se puede asignar con este script; el registro público siempre crea usuarios con rol `usuario`.

## Ejecución

```bash
npm run dev     # desarrollo, con reinicio automático (nodemon)
npm start       # producción
```

El servidor queda en `http://localhost:3000`. Comprobación rápida: `GET /api/salud` devuelve `{"ok":true}`.

## Estructura del proyecto

```
src/
├── config/        conexión a PostgreSQL
├── routes/        definición de rutas
├── controllers/   validación y lógica de cada endpoint
├── models/        acceso a datos (consultas SQL parametrizadas)
├── middlewares/   verificarToken (JWT) y soloAdmin (rol)
├── scripts/       initDb.js y crearAdmin.js
├── app.js
└── server.js
sql/schema.sql     modelo de datos
postman/           colección y entorno de pruebas
```

## Rutas

Prefijo `/api`. Los endpoints protegidos requieren la cabecera `Authorization: Bearer <token>`.

| Método y ruta | Acceso | Propósito | Respuestas |
|---|---|---|---|
| `POST /auth/registro` | Público | Registrar un usuario (rol `usuario`) | 201, 400, 409 |
| `POST /auth/login` | Público | Validar credenciales y emitir JWT | 200, 400, 401 |
| `GET /auth/perfil` | Autenticado | Ver id y rol del token | 200, 401 |
| `GET /productos` | Público | Listar productos (`?categoria=`) | 200 |
| `GET /productos/:id` | Público | Consultar un producto | 200, 400, 404 |
| `POST /productos` | Administrador | Crear producto | 201, 400, 401, 403 |
| `PUT /productos/:id` | Administrador | Actualizar producto | 200, 400, 401, 403, 404 |
| `DELETE /productos/:id` | Administrador | Eliminar producto | 204, 400, 401, 403, 404 |
| `GET /favoritos` | Autenticado | Listar mis favoritos | 200, 401 |
| `POST /favoritos` | Autenticado | Agregar un producto a mis favoritos | 201, 400, 401, 404, 409 |
| `DELETE /favoritos/:productoId` | Autenticado | Quitar un producto de mis favoritos | 204, 400, 401, 404 |

### Cuerpos de petición

**Registro** `POST /auth/registro`
```json
{ "nombre": "Ana Prueba", "correo": "ana@ejemplo.com", "password": "clave12345" }
```
La contraseña debe tener al menos 8 caracteres. Cualquier campo `rol` enviado se ignora.

**Login** `POST /auth/login`
```json
{ "correo": "ana@ejemplo.com", "password": "clave12345" }
```
Respuesta: `{ "ok": true, "token": "...", "usuario": { "id", "nombre", "correo", "rol" } }`

**Producto** `POST /productos` y `PUT /productos/:id`
```json
{ "nombre": "Webcam HD", "descripcion": "Cámara 1080p", "categoria": "Accesorios", "precio": 32.5 }
```

**Favorito** `POST /favoritos`
```json
{ "productoId": 1 }
```
La identidad del usuario sale siempre del token verificado, nunca del cuerpo ni de la URL.

### Formato de respuestas

- Éxito: `{ "ok": true, "data": ... }`
- Error: `{ "ok": false, "mensaje": "..." }`, y en validaciones `"errores": [ ... ]`
- Nunca se devuelven contraseñas ni hashes, ni detalles internos del servidor.

### Criterio de códigos HTTP

| Código | Uso |
|---|---|
| 200 | Consulta o actualización correcta |
| 201 | Creación correcta |
| 204 | Eliminación correcta (sin contenido) |
| 400 | Datos inválidos: campos vacíos, correo, precio o id mal formados |
| 401 | Sin token, token inválido o vencido, credenciales incorrectas |
| 403 | Autenticado pero sin rol administrador |
| 404 | Recurso inexistente (producto o favorito) |
| 409 | Duplicado (correo ya registrado o favorito repetido) |
| 500 | Error interno (mensaje genérico) |

Se usa 400 (y no 422) para todos los datos inválidos, para mantener un criterio único.

## Pruebas con Postman

1. Importa `postman/API_Catalogo.postman_collection.json` y `postman/API_Catalogo.postman_environment.json`.
2. Selecciona el entorno **API Catalogo - Local** y escribe en `adminPassword` el valor de `ADMIN_PASSWORD` de tu `.env`.
3. Con el servidor corriendo (`npm run dev`) y el administrador creado (`npm run admin:crear`), ejecuta con **Run collection** las carpetas `00` a `04`, en orden.
4. Para la persistencia: reinicia el servidor y ejecuta solo la carpeta `05`.

Casos cubiertos: registro y login correctos, correo duplicado y credenciales incorrectas, CRUD de productos como administrador, filtro por categoría, precio inválido y campos vacíos, producto inexistente, 401 sin token o con token inválido, 403 con rol usuario, favoritos (crear, listar, quitar, duplicado 409, inexistente 404), aislamiento entre usuarios A y B, eliminación en cascada y persistencia tras reiniciar.

## Seguridad

- Contraseñas con hash (bcrypt); nunca se devuelven.
- JWT firmado con `JWT_SECRET` y con vencimiento; se verifica firma y expiración en cada ruta protegida.
- Secretos solo en `.env` (excluido por `.gitignore`).
- Consultas SQL parametrizadas.

## Recursos y herramientas de apoyo

- Express, jsonwebtoken, bcryptjs, pg, dotenv, cors, nodemon
- Postman y pgAdmin 4
- Claude (Anthropic): asistente de IA usado como apoyo en la estructura del proyecto, el código de la API y la colección de pruebas; el código fue revisado, probado y explicado por el autor.
