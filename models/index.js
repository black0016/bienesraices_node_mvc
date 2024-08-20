import Propiedad from './Propiedad.js';
import Precio from './Precio.js';
import Categoria from './Categoria.js';
import Usuario from './Usuario.js';
import Mensaje from './Mensaje.js';

// Precio.hasOne(Propiedad);
// Establece una relación donde 'Propiedad' pertenece a 'Precio' usando 'precioId' como clave foránea
Propiedad.belongsTo(Precio, { foreignKey: 'precioId' });
// Establece una relación donde 'Propiedad' pertenece a 'Categoria' usando 'categoriaId' como clave foránea
Propiedad.belongsTo(Categoria, { foreignKey: 'categoriaId' });
// Establece una relación donde 'Propiedad' pertenece a 'Usuario' usando 'usuarioId' como clave foránea
Propiedad.belongsTo(Usuario, { foreignKey: 'usuarioId' });
// Establece una relación donde 'Propiedad' tiene muchos 'Mensaje' usando 'propiedadId' como clave foránea
Propiedad.hasMany(Mensaje, { foreignKey: 'propiedadId' });

// Establece una relación donde 'Mensaje' pertenece a 'Propiedad' usando 'propiedadId' como clave foránea
Mensaje.belongsTo(Propiedad, { foreignKey: 'propiedadId' });
// Establece una relación donde 'Mensaje' pertenece a 'Usuario' usando 'usuarioId' como clave foránea
Mensaje.belongsTo(Usuario, { foreignKey: 'usuarioId' });

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}