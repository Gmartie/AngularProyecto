const bcrypt = require('bcryptjs');

const usuarios = {
  'admin': 'admin123',
  'jefe01': 'jefe123',
  'tutor01': 'tutor123',
  'tutor02': 'tutor123',
  'profesor01': 'profesor123',
  'profesor02': 'profesor123',
  'profesor03': 'profesor123',
  'alumno01': 'alumno123',
  'alumno02': 'alumno123',
  'alumno03': 'alumno123',
  'alumno04': 'alumno123',
  'usuario01': 'usuario123'
};

(async () => {
  for (const [user, pass] of Object.entries(usuarios)) {
    const hash = await bcrypt.hash(pass, 10);
    console.log(`UPDATE usuarios SET password = '${hash}' WHERE usuario = '${user}';`);
  }
})();
