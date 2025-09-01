import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// --- CONFIGURACIÓN ---
// Estas son las credenciales que usarás para iniciar sesión.
// Puedes cambiarlas si lo deseas.
const ADMIN_EMAIL = 'admin@cotizaclix.com';
const ADMIN_PASSWORD = 'password123'; // ¡Usa una contraseña segura en producción!
// --- FIN DE LA CONFIGURACIÓN ---

// No es necesario modificar debajo de esta línea.

// Cargar la configuración del proyecto desde el archivo que ya tienes.
let firebaseConfig;
try {
  const configFile = readFileSync('./src/lib/firebase.ts', 'utf8');
  const match = configFile.match(/const firebaseConfig = (\{[\s\S]*?\});/);
  if (!match) throw new Error('No se pudo encontrar firebaseConfig en src/lib/firebase.ts');
  // Usar eval es generalmente inseguro, pero en este contexto controlado para leer
  // una configuración de un archivo local del proyecto, es aceptable.
  firebaseConfig = eval('(' + match[1] + ')');
} catch (error) {
  console.error('Error crítico: No se pudo leer la configuración de Firebase.', error);
  process.exit(1);
}

// Para usar el SDK de Admin, necesitamos una cuenta de servicio.
// Por ahora, usaremos la configuración del cliente que ya está disponible.
// Esto funcionará en entornos de desarrollo autenticados.
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
    });
    console.log('Firebase Admin SDK inicializado para el proyecto:', firebaseConfig.projectId);
}


async function setupAdminUser() {
  console.log(`Verificando o creando usuario administrador: ${ADMIN_EMAIL}`);

  try {
    // 1. Verificar si el usuario ya existe
    let userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL).catch(() => null);

    if (userRecord) {
      // Si el usuario existe, nos aseguramos de que la contraseña esté actualizada.
      console.log(`El usuario ${ADMIN_EMAIL} ya existe. Actualizando contraseña...`);
      await admin.auth().updateUser(userRecord.uid, {
        password: ADMIN_PASSWORD,
        emailVerified: true, // Lo marcamos como verificado
      });
       console.log('Contraseña actualizada.');
    } else {
      // Si el usuario no existe, lo creamos.
      console.log(`Creando nuevo usuario administrador...`);
      userRecord = await admin.auth().createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: 'Admin CotizaClix',
        emailVerified: true,
        disabled: false,
      });
      console.log(`¡Usuario ${ADMIN_EMAIL} creado exitosamente!`);
    }

    // 2. Establecer 'custom claims' para darle el rol de administrador.
    // Esto es útil para las reglas de seguridad de Firestore.
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('Rol de administrador asignado.');

    console.log('\n--- ¡Configuración completada! ---');
    console.log('Ahora puedes iniciar la aplicación y usar estas credenciales:\n');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
    console.log('\nPara iniciar la aplicación, ejecuta: npm run dev');
    console.log('------------------------------------');

  } catch (error) {
    console.error('\n--- ¡Error durante la configuración! ---');
    if (error.code === 'auth/invalid-password') {
        console.error('Error: La contraseña debe tener al menos 6 caracteres.');
    } else {
        console.error('Ocurrió un error inesperado:', error.message);
    }
    console.error('Por favor, revisa el error e inténtalo de nuevo.');
    console.log('-----------------------------------------');
    process.exit(1);
  }
}

setupAdminUser();
