const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorios si no existen
const directorios = [
  path.join(__dirname, '../../../frontend/public/FNaF_Profile'),
  path.join(__dirname, '../../../frontend/public/FNAF_Blueprints'),
  path.join(__dirname, '../../../frontend/public/Icons/tipos')
];

directorios.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determinar el directorio según el tipo de archivo
    if (file.fieldname === 'foto') {
      cb(null, path.join(__dirname, '../../../frontend/public/FNaF_Profile'));
    } else if (file.fieldname === 'planos') {
      cb(null, path.join(__dirname, '../../../frontend/public/FNAF_Blueprints'));
    } else if (file.fieldname === 'icono') {
      cb(null, path.join(__dirname, '../../../frontend/public/Icons/tipos'));
    } else {
      cb(new Error('Campo de archivo no válido'), null);
    }
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedMimes = {
    foto: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    planos: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    icono: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  };

  if (allowedMimes[file.fieldname] && allowedMimes[file.fieldname].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido para ${file.fieldname}. Solo se permiten imágenes.`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB por archivo
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir archivo: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  handleMulterError
};
