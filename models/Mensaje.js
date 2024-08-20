import { DataTypes } from 'sequelize';
import db from '../config/db.js';

// Define un modelo llamado 'Mensaje' en la base de datos
const Mensaje = db.define('mensajes', {
    // Define un campo llamado 'mensaje'
    mensaje: {
        // El tipo de dato del campo es STRING
        type: DataTypes.STRING,
        // El campo 'mensaje' no puede ser nulo
        allowNull: false
    }
});

export default Mensaje;