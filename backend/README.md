# API Gestión Formativa

API REST para gestión de módulos formativos del ciclo de Grado Superior DAW.

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
# Ejecutar el script SQL de la base de datos
npm run dev
```

## Endpoints

### Autenticación
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

### Módulos
- GET /api/modulos
- GET /api/modulos/:id
- POST /api/modulos
- PUT /api/modulos/:id
- DELETE /api/modulos/:id

### Alumnos y Profesores
- GET /api/alumnos
- GET /api/profesores