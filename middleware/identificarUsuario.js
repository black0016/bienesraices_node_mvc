import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const identificarUsuario = async (req, res, next) => {
    // Extrae el token de las cookies de la solicitud
    const { _token: token } = req.cookies;

    // Verifica si el token no existe
    if (!token) {
        // Si no hay token, establece el usuario en null
        req.usuario = null;
        // Llama a la siguiente función de middleware
        return next();
    }

    // Verifica si el token existe
    try {
        // Verifica el token JWT utilizando la clave secreta almacenada en las variables de entorno
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Busca al usuario en la base de datos por su ID, excluyendo el campo de la contraseña
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);

        // Si el usuario existe, lo asigna a la solicitud (req)
        if (usuario) {
            req.usuario = usuario;
        }

        // Llama a la siguiente función de middleware
        return next();
    } catch (error) {
        // Si ocurre un error, lo registra en la consola
        console.log('error', error);
        // Limpia la cookie '_token' y redirige al usuario a la página de inicio de sesión
        return res.clearCookie('_token').redirect('/auth/login');
    }

}

export default identificarUsuario;