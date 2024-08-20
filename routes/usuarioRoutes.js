import express from "express";
import { formularioLogin, autenticar, cerrarSesion, formularioRegistro, registrar, formularioOlvidePassword, confirmar, resetPassword, comprobarToken, nuevoPassword } from "../controllers/usuarioController.js";

// Importa el módulo de enrutador de Express
const router = express.Router();

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', formularioLogin);
// Ruta para manejar la autenticación de inicio de sesión
router.post('/login', autenticar);

// Ruta para cerrar la sesión de usuario
router.post('/cerrar-sesion', cerrarSesion);

// Ruta para mostrar el formulario de registro de usuario
router.get('/registro', formularioRegistro);
// Ruta para manejar el registro de un nuevo usuario
router.post('/registro', registrar);

// Ruta para confirmar la cuenta de usuario con un token
router.get('/confirmar/:token', confirmar);

// Ruta para mostrar el formulario de recuperación de contraseña
router.get('/olvide-password', formularioOlvidePassword);
// Ruta para manejar el envío del formulario de recuperación de contraseña
router.post('/olvide-password', resetPassword);

// Ruta para mostrar el formulario para establecer una nueva contraseña usando un token
router.get('/olvide-password/:token', comprobarToken);
// Ruta para manejar el envío del formulario para establecer una nueva contraseña
router.post('/olvide-password/:token', nuevoPassword);

export default router;