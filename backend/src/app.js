const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Importación de routes reales
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const rolesRoutes = require('./routes/roles.routes');
const localesRoutes = require('./routes/locales.routes');
const animatronicosRoutes = require('./routes/animatronicos.routes');
const tiposAnimatronicosRoutes = require('./routes/tiposanimatronicos.routes');
const animatronicoLocalRoutes = require('./routes/animatronico-local.routes');

const app = express();

// Configuración de CORS más permisiva para desarrollo
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Helmet con configuración para permitir carga de imágenes
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ NUEVO: Servir archivos estáticos desde la carpeta public del frontend
// Esto permite que las imágenes se sirvan sin necesidad de refrescar
const publicPath = path.join(__dirname, '../../frontend/public');
console.log('📁 Sirviendo archivos estáticos desde:', publicPath);

app.use('/FNaF_Profile', express.static(path.join(publicPath, 'FNaF_Profile')));
app.use('/FNAF_Blueprints', express.static(path.join(publicPath, 'FNAF_Blueprints')));
app.use('/FNaF_Icons', express.static(path.join(publicPath, 'FNaF_Icons')));
app.use('/Icons', express.static(path.join(publicPath, 'Icons')));
app.use('/Helpy', express.static(path.join(publicPath, 'Helpy')));

// Uso de routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/locales', localesRoutes);
app.use('/api/animatronicos', animatronicosRoutes);
app.use('/api/tipos-animatronicos', tiposAnimatronicosRoutes);
app.use('/api/animatronico-local', animatronicoLocalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

module.exports = app;
