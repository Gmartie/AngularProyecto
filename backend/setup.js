#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Estructura de carpetas
const folders = [
  'src',
  'src/config',
  'src/models',
  'src/dto',
  'src/services',
  'src/controllers',
  'src/routes',
  'src/middleware',
  'src/validators',
  'src/utils'
];

// Archivos y su contenido
const files = {
  'package.json': JSON.stringify({
    name: "gestion-formativa-api",
    version: "1.0.0",
    description: "API REST para gestión de módulos formativos",
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js"
    },
    dependencies: {
      express: "^4.18.2",
      mysql2: "^3.6.5",
      dotenv: "^16.3.1",
      bcryptjs: "^2.4.3",
      jsonwebtoken: "^9.0.2",
      "express-validator": "^7.0.1",
      cors: "^2.8.5",
      helmet: "^7.1.0",
      compression: "^1.7.4",
      morgan: "^1.10.0"
    },
    devDependencies: {
      nodemon: "^3.0.2"
    }
  }, null, 2),

  '.env.example': 'NODE_ENV=development\nPORT=3000\n\nDB_HOST=localhost\nDB_USER=root\nDB_PASSWORD=tu_password\nDB_NAME=gestion_formativa\nDB_PORT=3306\n\nJWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion\nJWT_EXPIRES_IN=24h',

  '.gitignore': 'node_modules/\n.env\n*.log\n.DS_Store\ndist/\nbuild/',

  'README.md': '# API Gestión Formativa\n\nAPI REST para gestión de módulos formativos del ciclo de Grado Superior DAW.\n\n## Instalación\n\n```bash\nnpm install\ncp .env.example .env\n# Editar .env con tus credenciales\n# Ejecutar el script SQL de la base de datos\nnpm run dev\n```\n\n## Endpoints\n\n### Autenticación\n- POST /api/auth/login\n- POST /api/auth/register\n- GET /api/auth/me\n\n### Módulos\n- GET /api/modulos\n- GET /api/modulos/:id\n- POST /api/modulos\n- PUT /api/modulos/:id\n- DELETE /api/modulos/:id\n\n### Alumnos y Profesores\n- GET /api/alumnos\n- GET /api/profesores',

  'server.js': 'const app = require(\'./src/app\');\nconst dotenv = require(\'dotenv\');\n\ndotenv.config();\n\nconst PORT = process.env.PORT || 3000;\n\napp.listen(PORT, () => {\n  console.log(`Servidor corriendo en puerto ${PORT}`);\n  console.log(`Modo: ${process.env.NODE_ENV}`);\n  console.log(`URL: http://localhost:${PORT}/api/health`);\n});',

  'src/app.js': 'const express = require(\'express\');\nconst cors = require(\'cors\');\nconst helmet = require(\'helmet\');\nconst compression = require(\'compression\');\nconst morgan = require(\'morgan\');\n\nconst authRoutes = require(\'./routes/auth.routes\');\nconst usuarioRoutes = require(\'./routes/usuario.routes\');\nconst profesorRoutes = require(\'./routes/profesor.routes\');\nconst alumnoRoutes = require(\'./routes/alumno.routes\');\nconst moduloRoutes = require(\'./routes/modulo.routes\');\n\nconst app = express();\n\napp.use(helmet());\napp.use(cors());\napp.use(compression());\napp.use(morgan(\'dev\'));\napp.use(express.json());\napp.use(express.urlencoded({ extended: true }));\n\napp.use(\'/api/auth\', authRoutes);\napp.use(\'/api/usuarios\', usuarioRoutes);\napp.use(\'/api/profesores\', profesorRoutes);\napp.use(\'/api/alumnos\', alumnoRoutes);\napp.use(\'/api/modulos\', moduloRoutes);\n\napp.get(\'/api/health\', (req, res) => {\n  res.json({ \n    status: \'OK\', \n    message: \'API funcionando correctamente\',\n    timestamp: new Date().toISOString()\n  });\n});\n\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(err.status || 500).json({\n    success: false,\n    message: err.message || \'Error interno del servidor\',\n    ...(process.env.NODE_ENV === \'development\' && { stack: err.stack })\n  });\n});\n\napp.use((req, res) => {\n  res.status(404).json({\n    success: false,\n    message: \'Ruta no encontrada\'\n  });\n});\n\nmodule.exports = app;',

  'src/config/database.js': 'const mysql = require(\'mysql2/promise\');\nconst dotenv = require(\'dotenv\');\n\ndotenv.config();\n\nconst pool = mysql.createPool({\n  host: process.env.DB_HOST,\n  user: process.env.DB_USER,\n  password: process.env.DB_PASSWORD,\n  database: process.env.DB_NAME,\n  port: process.env.DB_PORT,\n  waitForConnections: true,\n  connectionLimit: 10,\n  queueLimit: 0\n});\n\npool.getConnection()\n  .then(connection => {\n    console.log(\'Conexion a base de datos establecida\');\n    connection.release();\n  })\n  .catch(err => {\n    console.error(\'Error conectando a la base de datos:\', err.message);\n  });\n\nmodule.exports = pool;',

  'src/utils/response.util.js': 'class ResponseUtil {\n  static success(res, data, message = \'Operacion exitosa\', statusCode = 200) {\n    return res.status(statusCode).json({\n      success: true,\n      message,\n      data\n    });\n  }\n\n  static error(res, message = \'Error en la operacion\', statusCode = 500, errors = null) {\n    return res.status(statusCode).json({\n      success: false,\n      message,\n      ...(errors && { errors })\n    });\n  }\n\n  static created(res, data, message = \'Recurso creado exitosamente\') {\n    return this.success(res, data, message, 201);\n  }\n}\n\nmodule.exports = ResponseUtil;',

  'src/utils/errors.util.js': 'class AppError extends Error {\n  constructor(message, statusCode) {\n    super(message);\n    this.statusCode = statusCode;\n    this.isOperational = true;\n    Error.captureStackTrace(this, this.constructor);\n  }\n}\n\nclass ValidationError extends AppError {\n  constructor(message) {\n    super(message, 400);\n  }\n}\n\nclass NotFoundError extends AppError {\n  constructor(message = \'Recurso no encontrado\') {\n    super(message, 404);\n  }\n}\n\nclass UnauthorizedError extends AppError {\n  constructor(message = \'No autorizado\') {\n    super(message, 401);\n  }\n}\n\nclass ForbiddenError extends AppError {\n  constructor(message = \'Acceso prohibido\') {\n    super(message, 403);\n  }\n}\n\nmodule.exports = {\n  AppError,\n  ValidationError,\n  NotFoundError,\n  UnauthorizedError,\n  ForbiddenError\n};',

  'src/dto/usuario.dto.js': 'class UsuarioDTO {\n  static toResponse(usuario) {\n    return {\n      id: usuario.id,\n      usuario: usuario.usuario,\n      email: usuario.email,\n      activo: usuario.activo,\n      fechaRegistro: usuario.fecha_registro\n    };\n  }\n\n  static toDetailResponse(usuario, roles = []) {\n    return {\n      ...this.toResponse(usuario),\n      roles: roles.map(r => ({\n        id: r.id,\n        nombre: r.nombre\n      }))\n    };\n  }\n}\n\nmodule.exports = UsuarioDTO;',

  'src/dto/profesor.dto.js': 'class ProfesorDTO {\n  static toResponse(profesor) {\n    return {\n      id: profesor.id,\n      nombre: profesor.nombre,\n      titulacion: profesor.titulacion,\n      cargo: profesor.cargo,\n      usuario: {\n        id: profesor.usuario_id,\n        usuario: profesor.usuario,\n        email: profesor.email\n      }\n    };\n  }\n\n  static toListResponse(profesor) {\n    return {\n      id: profesor.id,\n      nombre: profesor.nombre,\n      cargo: profesor.cargo,\n      email: profesor.email\n    };\n  }\n}\n\nmodule.exports = ProfesorDTO;',

  'src/dto/alumno.dto.js': 'class AlumnoDTO {\n  static toResponse(alumno) {\n    return {\n      id: alumno.id,\n      nombre: alumno.nombre,\n      email: alumno.email,\n      movil: alumno.movil,\n      usuario: {\n        id: alumno.usuario_id,\n        usuario: alumno.usuario\n      }\n    };\n  }\n\n  static toListResponse(alumno) {\n    return {\n      id: alumno.id,\n      nombre: alumno.nombre,\n      email: alumno.email\n    };\n  }\n}\n\nmodule.exports = AlumnoDTO;',

  'src/dto/modulo.dto.js': 'class ModuloDTO {\n  static toResponse(modulo) {\n    return {\n      id: modulo.id,\n      codigo: modulo.codigo,\n      nombre: modulo.nombre,\n      horasSemanales: modulo.horas_semanales,\n      curso: modulo.curso,\n      profesor: modulo.profesor_id ? {\n        id: modulo.profesor_id,\n        nombre: modulo.profesor_nombre\n      } : null\n    };\n  }\n}\n\nmodule.exports = ModuloDTO;',

  'src/dto/auth.dto.js': 'class AuthDTO {\n  static toLoginResponse(usuario, token, roles = []) {\n    return {\n      token,\n      usuario: {\n        id: usuario.id,\n        usuario: usuario.usuario,\n        email: usuario.email,\n        roles: roles.map(r => r.nombre)\n      }\n    };\n  }\n}\n\nmodule.exports = AuthDTO;',

  'src/middleware/auth.middleware.js': 'const jwt = require(\'jsonwebtoken\');\nconst { UnauthorizedError } = require(\'../utils/errors.util\');\nconst ResponseUtil = require(\'../utils/response.util\');\n\nconst authMiddleware = async (req, res, next) => {\n  try {\n    const authHeader = req.headers.authorization;\n\n    if (!authHeader || !authHeader.startsWith(\'Bearer \')) {\n      throw new UnauthorizedError(\'Token no proporcionado\');\n    }\n\n    const token = authHeader.split(\' \')[1];\n\n    try {\n      const decoded = jwt.verify(token, process.env.JWT_SECRET);\n      req.user = decoded;\n      next();\n    } catch (error) {\n      throw new UnauthorizedError(\'Token invalido o expirado\');\n    }\n  } catch (error) {\n    return ResponseUtil.error(res, error.message, error.statusCode || 401);\n  }\n};\n\nmodule.exports = authMiddleware;',

  'src/middleware/permission.middleware.js': 'const pool = require(\'../config/database\');\nconst { ForbiddenError } = require(\'../utils/errors.util\');\nconst ResponseUtil = require(\'../utils/response.util\');\n\nconst checkPermission = (recurso, accion) => {\n  return async (req, res, next) => {\n    try {\n      const userId = req.user.id;\n\n      const query = `\n        SELECT p.* \n        FROM permisos p\n        INNER JOIN roles_permisos rp ON p.id = rp.permiso_id\n        INNER JOIN usuarios_roles ur ON rp.rol_id = ur.rol_id\n        WHERE ur.usuario_id = ? \n        AND p.recurso = ? \n        AND p.accion = ?\n      `;\n\n      const [permisos] = await pool.query(query, [userId, recurso, accion]);\n\n      if (permisos.length === 0) {\n        throw new ForbiddenError(\'No tienes permisos para realizar esta accion\');\n      }\n\n      next();\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 403);\n    }\n  };\n};\n\nconst checkRole = (...roles) => {\n  return async (req, res, next) => {\n    try {\n      const userId = req.user.id;\n\n      const query = `\n        SELECT r.nombre \n        FROM roles r\n        INNER JOIN usuarios_roles ur ON r.id = ur.rol_id\n        WHERE ur.usuario_id = ?\n      `;\n\n      const [userRoles] = await pool.query(query, [userId]);\n\n      const hasRole = userRoles.some(r => roles.includes(r.nombre));\n\n      if (!hasRole) {\n        throw new ForbiddenError(\'No tienes el rol necesario para esta accion\');\n      }\n\n      next();\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 403);\n    }\n  };\n};\n\nmodule.exports = { checkPermission, checkRole };',

  'src/middleware/validation.middleware.js': 'const { validationResult } = require(\'express-validator\');\nconst ResponseUtil = require(\'../utils/response.util\');\n\nconst validate = (req, res, next) => {\n  const errors = validationResult(req);\n  \n  if (!errors.isEmpty()) {\n    return ResponseUtil.error(\n      res,\n      \'Errores de validacion\',\n      400,\n      errors.array()\n    );\n  }\n  \n  next();\n};\n\nmodule.exports = validate;',

  'src/validators/modulo.validator.js': 'const { body } = require(\'express-validator\');\n\nconst crearModuloValidator = [\n  body(\'codigo\')\n    .trim()\n    .notEmpty()\n    .withMessage(\'El codigo es obligatorio\'),\n  body(\'nombre\')\n    .trim()\n    .notEmpty()\n    .withMessage(\'El nombre es obligatorio\'),\n  body(\'horasSemanales\')\n    .isInt({ min: 1, max: 40 })\n    .withMessage(\'Las horas semanales deben estar entre 1 y 40\'),\n  body(\'curso\')\n    .isIn([\'Primero\', \'Segundo\'])\n    .withMessage(\'El curso debe ser Primero o Segundo\')\n];\n\nmodule.exports = { crearModuloValidator };',

  'src/services/auth.service.js': 'const bcrypt = require(\'bcryptjs\');\nconst jwt = require(\'jsonwebtoken\');\nconst pool = require(\'../config/database\');\nconst { UnauthorizedError, ValidationError } = require(\'../utils/errors.util\');\n\nclass AuthService {\n  async login(usuario, password) {\n    const [users] = await pool.query(\n      \'SELECT * FROM usuarios WHERE usuario = ? AND activo = TRUE\',\n      [usuario]\n    );\n\n    if (users.length === 0) {\n      throw new UnauthorizedError(\'Credenciales invalidas\');\n    }\n\n    const user = users[0];\n    const isValidPassword = await bcrypt.compare(password, user.password);\n\n    if (!isValidPassword) {\n      throw new UnauthorizedError(\'Credenciales invalidas\');\n    }\n\n    const queryRoles = `\n      SELECT r.id, r.nombre \n      FROM roles r\n      INNER JOIN usuarios_roles ur ON r.id = ur.rol_id\n      WHERE ur.usuario_id = ?\n    `;\n\n    const [roles] = await pool.query(queryRoles, [user.id]);\n\n    const token = jwt.sign(\n      { \n        id: user.id, \n        usuario: user.usuario,\n        roles: roles.map(r => r.nombre)\n      },\n      process.env.JWT_SECRET,\n      { expiresIn: process.env.JWT_EXPIRES_IN }\n    );\n\n    return { user, token, roles };\n  }\n\n  async register(usuarioData, rolNombre = \'Usuario Registrado\') {\n    const { usuario, email, password } = usuarioData;\n\n    const [existing] = await pool.query(\n      \'SELECT id FROM usuarios WHERE usuario = ? OR email = ?\',\n      [usuario, email]\n    );\n\n    if (existing.length > 0) {\n      throw new ValidationError(\'El usuario o email ya existe\');\n    }\n\n    const hashedPassword = await bcrypt.hash(password, 10);\n\n    const [result] = await pool.query(\n      \'INSERT INTO usuarios (usuario, email, password) VALUES (?, ?, ?)\',\n      [usuario, email, hashedPassword]\n    );\n\n    const userId = result.insertId;\n\n    const [rol] = await pool.query(\'SELECT id FROM roles WHERE nombre = ?\', [rolNombre]);\n    \n    if (rol.length > 0) {\n      await pool.query(\n        \'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)\',\n        [userId, rol[0].id]\n      );\n    }\n\n    const [newUser] = await pool.query(\'SELECT * FROM usuarios WHERE id = ?\', [userId]);\n    \n    return newUser[0];\n  }\n}\n\nmodule.exports = new AuthService();',

  'src/services/modulo.service.js': 'const pool = require(\'../config/database\');\nconst { NotFoundError, ValidationError } = require(\'../utils/errors.util\');\n\nclass ModuloService {\n  async getAll(curso = null) {\n    let query = `\n      SELECT m.*, p.nombre as profesor_nombre \n      FROM modulos m\n      LEFT JOIN profesores p ON m.profesor_id = p.id\n    `;\n    \n    const params = [];\n    \n    if (curso) {\n      query += \' WHERE m.curso = ?\';\n      params.push(curso);\n    }\n    \n    query += \' ORDER BY m.curso, m.codigo\';\n\n    const [modulos] = await pool.query(query, params);\n    return modulos;\n  }\n\n  async getById(id) {\n    const query = `\n      SELECT m.*, p.nombre as profesor_nombre \n      FROM modulos m\n      LEFT JOIN profesores p ON m.profesor_id = p.id\n      WHERE m.id = ?\n    `;\n\n    const [modulos] = await pool.query(query, [id]);\n\n    if (modulos.length === 0) {\n      throw new NotFoundError(\'Modulo no encontrado\');\n    }\n\n    return modulos[0];\n  }\n\n  async create(moduloData) {\n    const { codigo, nombre, horasSemanales, curso, profesorId } = moduloData;\n\n    const [existing] = await pool.query(\'SELECT id FROM modulos WHERE codigo = ?\', [codigo]);\n    \n    if (existing.length > 0) {\n      throw new ValidationError(\'Ya existe un modulo con ese codigo\');\n    }\n\n    const [result] = await pool.query(\n      \'INSERT INTO modulos (codigo, nombre, horas_semanales, curso, profesor_id) VALUES (?, ?, ?, ?, ?)\',\n      [codigo, nombre, horasSemanales, curso, profesorId || null]\n    );\n\n    return this.getById(result.insertId);\n  }\n\n  async update(id, moduloData) {\n    await this.getById(id);\n\n    const updates = [];\n    const values = [];\n\n    if (moduloData.codigo) {\n      updates.push(\'codigo = ?\');\n      values.push(moduloData.codigo);\n    }\n    if (moduloData.nombre) {\n      updates.push(\'nombre = ?\');\n      values.push(moduloData.nombre);\n    }\n    if (moduloData.horasSemanales) {\n      updates.push(\'horas_semanales = ?\');\n      values.push(moduloData.horasSemanales);\n    }\n    if (moduloData.curso) {\n      updates.push(\'curso = ?\');\n      values.push(moduloData.curso);\n    }\n    if (moduloData.profesorId !== undefined) {\n      updates.push(\'profesor_id = ?\');\n      values.push(moduloData.profesorId);\n    }\n\n    if (updates.length > 0) {\n      values.push(id);\n      await pool.query(\n        `UPDATE modulos SET ${updates.join(\', \')} WHERE id = ?`,\n        values\n      );\n    }\n\n    return this.getById(id);\n  }\n\n  async delete(id) {\n    await this.getById(id);\n    await pool.query(\'DELETE FROM modulos WHERE id = ?\', [id]);\n  }\n}\n\nmodule.exports = new ModuloService();',

  'src/controllers/auth.controller.js': 'const authService = require(\'../services/auth.service\');\nconst AuthDTO = require(\'../dto/auth.dto\');\nconst ResponseUtil = require(\'../utils/response.util\');\n\nclass AuthController {\n  async login(req, res) {\n    try {\n      const { usuario, password } = req.body;\n      const { user, token, roles } = await authService.login(usuario, password);\n      \n      const response = AuthDTO.toLoginResponse(user, token, roles);\n      return ResponseUtil.success(res, response, \'Login exitoso\');\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n\n  async register(req, res) {\n    try {\n      const usuario = await authService.register(req.body);\n      return ResponseUtil.created(res, usuario, \'Usuario registrado exitosamente\');\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n\n  async me(req, res) {\n    try {\n      const pool = require(\'../config/database\');\n      const [users] = await pool.query(\n        \'SELECT * FROM usuarios WHERE id = ?\',\n        [req.user.id]\n      );\n\n      const queryRoles = `\n        SELECT r.id, r.nombre \n        FROM roles r\n        INNER JOIN usuarios_roles ur ON r.id = ur.rol_id\n        WHERE ur.usuario_id = ?\n      `;\n\n      const [roles] = await pool.query(queryRoles, [req.user.id]);\n\n      const UsuarioDTO = require(\'../dto/usuario.dto\');\n      const response = UsuarioDTO.toDetailResponse(users[0], roles);\n      \n      return ResponseUtil.success(res, response);\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n}\n\nmodule.exports = new AuthController();',

  'src/controllers/modulo.controller.js': 'const moduloService = require(\'../services/modulo.service\');\nconst ModuloDTO = require(\'../dto/modulo.dto\');\nconst ResponseUtil = require(\'../utils/response.util\');\n\nclass ModuloController {\n  async getAll(req, res) {\n    try {\n      const { curso } = req.query;\n      const modulos = await moduloService.getAll(curso);\n      const response = modulos.map(m => ModuloDTO.toResponse(m));\n      return ResponseUtil.success(res, response);\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n\n  async getById(req, res) {\n    try {\n      const modulo = await moduloService.getById(req.params.id);\n      const response = ModuloDTO.toResponse(modulo);\n      return ResponseUtil.success(res, response);\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n\n  async create(req, res) {\n    try {\n      const modulo = await moduloService.create(req.body);\n      const response = ModuloDTO.toResponse(modulo);\n      return ResponseUtil.created(res, response, \'Modulo creado exitosamente\');\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n\n  async update(req, res) {\n    try {\n      const modulo = await moduloService.update(req.params.id, req.body);\n      const response = ModuloDTO.toResponse(modulo);\n      return ResponseUtil.success(res, response, \'Modulo actualizado exitosamente\');\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n\n  async delete(req, res) {\n    try {\n      await moduloService.delete(req.params.id);\n      return ResponseUtil.success(res, null, \'Modulo eliminado exitosamente\');\n    } catch (error) {\n      return ResponseUtil.error(res, error.message, error.statusCode || 500);\n    }\n  }\n}\n\nmodule.exports = new ModuloController();',

  'src/routes/auth.routes.js': 'const express = require(\'express\');\nconst router = express.Router();\nconst authController = require(\'../controllers/auth.controller\');\nconst authMiddleware = require(\'../middleware/auth.middleware\');\nconst { body } = require(\'express-validator\');\nconst validate = require(\'../middleware/validation.middleware\');\n\nconst loginValidator = [\n  body(\'usuario\').notEmpty().withMessage(\'El usuario es obligatorio\'),\n  body(\'password\').notEmpty().withMessage(\'La contrasena es obligatoria\')\n];\n\nconst registerValidator = [\n  body(\'usuario\').trim().isLength({ min: 3 }).withMessage(\'Usuario minimo 3 caracteres\'),\n  body(\'email\').isEmail().withMessage(\'Email invalido\'),\n  body(\'password\').isLength({ min: 6 }).withMessage(\'Contrasena minimo 6 caracteres\')\n];\n\nrouter.post(\'/login\', loginValidator, validate, authController.login);\nrouter.post(\'/register\', registerValidator, validate, authController.register);\nrouter.get(\'/me\', authMiddleware, authController.me);\n\nmodule.exports = router;',

  'src/routes/modulo.routes.js': 'const express = require(\'express\');\nconst router = express.Router();\nconst moduloController = require(\'../controllers/modulo.controller\');\nconst authMiddleware = require(\'../middleware/auth.middleware\');\nconst { checkPermission } = require(\'../middleware/permission.middleware\');\nconst { crearModuloValidator } = require(\'../validators/modulo.validator\');\nconst validate = require(\'../middleware/validation.middleware\');\n\nrouter.get(\'/\', authMiddleware, checkPermission(\'modulos\', \'leer\'), moduloController.getAll);\nrouter.get(\'/:id\', authMiddleware, checkPermission(\'modulos\', \'leer\'), moduloController.getById);\nrouter.post(\'/\', authMiddleware, checkPermission(\'modulos\', \'crear\'), crearModuloValidator, validate, moduloController.create);\nrouter.put(\'/:id\', authMiddleware, checkPermission(\'modulos\', \'actualizar\'), moduloController.update);\nrouter.delete(\'/:id\', authMiddleware, checkPermission(\'modulos\', \'eliminar\'), moduloController.delete);\n\nmodule.exports = router;',

  'src/routes/alumno.routes.js': 'const express = require(\'express\');\nconst router = express.Router();\nconst authMiddleware = require(\'../middleware/auth.middleware\');\n\nrouter.get(\'/\', authMiddleware, (req, res) => {\n  res.json({ message: \'Lista de alumnos - Por implementar\' });\n});\n\nmodule.exports = router;',

  'src/routes/profesor.routes.js': 'const express = require(\'express\');\nconst router = express.Router();\nconst authMiddleware = require(\'../middleware/auth.middleware\');\n\nrouter.get(\'/\', authMiddleware, (req, res) => {\n  res.json({ message: \'Lista de profesores - Por implementar\' });\n});\n\nmodule.exports = router;',

  'src/routes/usuario.routes.js': 'const express = require(\'express\');\nconst router = express.Router();\nconst authMiddleware = require(\'../middleware/auth.middleware\');\n\nrouter.get(\'/\', authMiddleware, (req, res) => {\n  res.json({ message: \'Lista de usuarios - Por implementar\' });\n});\n\nmodule.exports = router;'
};

// Función principal
function createProjectStructure() {
  log('\nIniciando creacion del proyecto...\n', 'blue');

  log('Creando estructura de carpetas...', 'yellow');
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      log(`  OK ${folder}`, 'green');
    }
  });

  log('\nCreando archivos...', 'yellow');
  Object.entries(files).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    log(`  OK ${filePath}`, 'green');
  });

  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
    log('\n  OK .env creado desde .env.example', 'green');
  }

  log('\nProyecto creado exitosamente!\n', 'green');
  log('Proximos pasos:\n', 'blue');
  log('1. Edita el archivo .env con tus credenciales', 'yellow');
  log('2. Ejecuta el script SQL de la base de datos', 'yellow');
  log('3. npm install', 'yellow');
  log('4. npm run dev\n', 'yellow');
}

try {
  createProjectStructure();
} catch (error) {
  log(`\nError: ${error.message}\n`, 'red');
  process.exit(1);
}
