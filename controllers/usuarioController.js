import { check, validationResult, body } from 'express-validator';
import bcrypt from 'bcrypt';

import Usuario from '../models/Usuario.js';
import { generarJWT, generarId } from '../helpers/token.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';

// Función para renderizar la página de inicio de sesión
const formularioLogin = (req, res) => {
    // Renderiza la vista 'auth/login' y pasa un objeto con dos propiedades:
    // 'pagina': El título de la página, en este caso 'Iniciar Sesión'
    // 'csrfToken': Un token CSRF generado a partir de la solicitud para proteger contra ataques CSRF
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
}

// Función asincrónica para autenticar a un usuario
const autenticar = async (req, res) => {
    // Validación de los campos del formulario
    await check('email').isEmail().withMessage('El Email es Obligatorio').run(req);
    await check('password').notEmpty().withMessage('El Password es Obligatorio').run(req);

    // Verificar las validaciones de los campos del formulario
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        // Si hay errores, renderizar la vista de login con los errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    // Aplicar desestructuración de objetos para obtener el email y password del cuerpo de la solicitud
    const { email, password } = req.body;

    // Comprobar si el usuario existe en la base de datos
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        // Si el usuario no existe, renderizar la vista de login con un mensaje de error
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario No Existe' }]
        });
    }

    // Comprobar si el usuario ha confirmado su cuenta
    if (!usuario.confirmado) {
        // Si el usuario no ha confirmado su cuenta, renderizar la vista de login con un mensaje de error
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Tu Cuenta no ha sido confirmada' }]
        });
    }

    // Revisar si el password es correcto
    if (!usuario.verificarPassword(password)) {
        // Si el password es incorrecto, renderizar la vista de login con un mensaje de error
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El password es incorrecto' }]
        });
    }

    // Autenticar al usuario generando un token JWT
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

    // Almacenar el token en una cookie y redirigir al usuario a la página de "mis propiedades"
    return res.cookie('_token', token, {
        httpOnly: true, // La cookie solo es accesible a través del protocolo HTTP
        // secure: true, // La cookie solo se enviará a través de conexiones HTTPS (descomentarlo en producción)
        // sameSite: true, // La cookie solo se enviará en solicitudes del mismo sitio (descomentarlo si es necesario)
    }).redirect('/mis-propiedades');
}

// Función para cerrar la sesión de usuario
const cerrarSesion = (req, res) => {
    // Limpiar la cookie del token y redirigir al usuario a la página de inicio de sesión
    return res.clearCookie('_token').status(200).redirect('/auth/login');
}

// Función para renderizar la página de registro de usuario
const formularioRegistro = (req, res) => {
    // Renderiza la vista 'auth/registro' y pasa un objeto con dos propiedades:
    // 'pagina': El título de la página, en este caso 'Crear Cuenta'
    // 'csrfToken': Un token CSRF generado a partir de la solicitud para proteger contra ataques CSRF
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
}

// Función asincrónica para registrar un nuevo usuario
const registrar = async (req, res) => {
    // Validación de los campos del formulario
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacío').run(req);
    await check('email').isEmail().withMessage('Eso no parece un email').run(req);
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req);

    // Comparar los valores de los campos password y repetir_password
    await body('repetir_password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Los passwords no son iguales')
        .run(req);

    // Verificar las validaciones de los campos del formulario
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        // Si hay errores, renderizar la vista de registro con los errores y los datos ingresados
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        });
    }

    // Extraer los datos del cuerpo de la solicitud
    const { nombre, email, password } = req.body;

    // Verificar que el usuario no esté registrado
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
        // Si el usuario ya está registrado, renderizar la vista de registro con un mensaje de error
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario ya está registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    // Almacenar un nuevo usuario en la base de datos
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    // Enviar email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    });

    // Mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un Email de Confirmación, presiona en el enlace'
    });
}

// Función asincrónica para confirmar la cuenta de un usuario
const confirmar = async (req, res) => {
    // Extraer el token de los parámetros de la solicitud
    const { token } = req.params;

    // Verificar si el token es válido buscando al usuario en la base de datos
    const usuario = await Usuario.findOne({ where: { token } });

    // Si el usuario no existe, renderizar la vista de error de confirmación
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        });
    }

    // Confirmar la cuenta del usuario
    usuario.token = null; // Eliminar el token
    usuario.confirmado = true; // Marcar la cuenta como confirmada
    await usuario.save(); // Guardar los cambios en la base de datos

    // Renderizar la vista de confirmación exitosa
    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmó correctamente'
    });
}

// Función para renderizar la página de recuperación de contraseña
const formularioOlvidePassword = (req, res) => {
    // Renderiza la vista 'auth/olvide-password' y pasa un objeto con dos propiedades:
    // 'pagina': El título de la página, en este caso 'Recupera tu acceso a Bienes Raices'
    // 'csrfToken': Un token CSRF generado a partir de la solicitud para proteger contra ataques CSRF
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(),
    });
}

// Función asincrónica para manejar la solicitud de restablecimiento de contraseña
const resetPassword = async (req, res) => {
    // Validación del campo de email en el formulario
    await check('email').isEmail().withMessage('Eso no parece un email').run(req);
    let resultado = validationResult(req);

    // Verificar las validaciones de los campos del formulario
    if (!resultado.isEmpty()) {
        // Si hay errores, renderizar la vista de recuperación de contraseña con los errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    // Extraer el email del cuerpo de la solicitud
    const { email } = req.body;

    // Buscar el usuario en la base de datos por su email
    const usuario = await Usuario.findOne({ where: { email } });

    // Si el usuario no existe, renderizar la vista de recuperación de contraseña con un mensaje de error
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Email no Pertenece a ningún usuario' }]
        });
    }

    // Generar un nuevo token para el usuario y guardarlo en la base de datos
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email con las instrucciones para restablecer la contraseña
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    });

    // Renderizar un mensaje indicando que se ha enviado el email con las instrucciones
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones'
    });
}

// Función asincrónica para comprobar la validez de un token de restablecimiento de contraseña
const comprobarToken = async (req, res) => {
    // Extraer el token de los parámetros de la solicitud
    const { token } = req.params;

    // Buscar al usuario en la base de datos por el token
    const usuario = await Usuario.findOne({ where: { token } });

    // Si el usuario no existe, renderizar la vista de error de confirmación
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        });
    }

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece Tu Password',
        csrfToken: req.csrfToken(),
    });
}

// Función asincrónica para manejar la solicitud de cambio de contraseña
const nuevoPassword = async (req, res) => {
    // Validar el campo de password en el formulario
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres').run(req);
    let resultado = validationResult(req);

    // Verificar las validaciones de los campos del formulario
    if (!resultado.isEmpty()) {
        // Si hay errores, renderizar la vista de restablecimiento de contraseña con los errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece Tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    // Extraer el token de los parámetros de la solicitud y el nuevo password del cuerpo de la solicitud
    const { token } = req.params;
    const { password } = req.body;

    // Identificar al usuario que hace el cambio de contraseña buscando por el token
    const usuario = await Usuario.findOne({ where: { token } });

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null; // Eliminar el token

    // Guardar los cambios en la base de datos
    await usuario.save();

    // Renderizar la vista de confirmación de cambio de contraseña
    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardó correctamente',
    });
}

// Exportar las funciones del controlador de usuario para que puedan ser utilizadas en otras partes de la aplicación
export {
    formularioLogin,          // Función para renderizar la página de inicio de sesión
    autenticar,               // Función para autenticar a un usuario
    cerrarSesion,             // Función para cerrar la sesión de usuario
    formularioRegistro,       // Función para renderizar la página de registro de usuario
    registrar,                // Función para registrar un nuevo usuario
    confirmar,                // Función para confirmar la cuenta de un usuario
    formularioOlvidePassword, // Función para renderizar la página de recuperación de contraseña
    resetPassword,            // Función para manejar la solicitud de restablecimiento de contraseña
    comprobarToken,           // Función para comprobar la validez de un token de restablecimiento de contraseña
    nuevoPassword,            // Función para manejar la solicitud de cambio de contraseña
}