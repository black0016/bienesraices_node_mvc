import { Sequelize } from 'sequelize';

import { Propiedad, Precio, Categoria } from '../models/index.js';

// Función asíncrona que maneja la solicitud para la página de inicio
const inicio = async (req, res) => {
    // Ejecuta múltiples consultas a la base de datos en paralelo y espera a que todas se completen
    const [categorias, precios, casas, departamentos] = await Promise.all([
        // Obtiene todas las categorías de la base de datos y las devuelve en formato plano (raw)
        Categoria.findAll({ raw: true }),
        // Obtiene todos los precios de la base de datos y los devuelve en formato plano (raw)
        Precio.findAll({ raw: true }),
        // Obtiene las 3 propiedades más recientes de la categoría 'casas' (categoriaId: 1)
        // Incluye la información del precio asociado y ordena por fecha de creación descendente
        Propiedad.findAll({
            limit: 3,
            where: { categoriaId: 1 },
            include: [
                { model: Precio, as: 'precio' }
            ],
            order: [['createdAt', 'DESC']]
        }),
        // Obtiene las 3 propiedades más recientes de la categoría 'departamentos' (categoriaId: 2)
        // Incluye la información del precio asociado y ordena por fecha de creación descendente
        Propiedad.findAll({
            limit: 3,
            where: { categoriaId: 2 },
            include: [
                { model: Precio, as: 'precio' }
            ],
            order: [['createdAt', 'DESC']]
        }),
    ]);

    // Renderiza la vista 'inicio' y pasa los datos obtenidos a la plantilla
    res.render('inicio', {
        pagina: 'Inicio', // Título de la página
        categorias,       // Categorías obtenidas de la base de datos
        precios,          // Precios obtenidos de la base de datos
        casas,            // Propiedades de la categoría 'casas'
        departamentos,     // Propiedades de la categoría 'departamentos'
        csrfToken: req.csrfToken(), // Token CSRF para protección contra falsificación de solicitudes entre sitios
    });
}

// Función asíncrona que maneja la solicitud para una categoría específica
const categoria = async (req, res) => {
    // Extrae el id de la categoría de los parámetros de la solicitud
    const { id } = req.params;

    // Busca la categoría en la base de datos por su clave primaria (id)
    const categoria = await Categoria.findByPk(id);
    // Si la categoría no existe, redirige a la página de error 404
    if (!categoria) {
        return res.redirect('/404');
    }

    // Busca todas las propiedades que pertenecen a la categoría especificada
    // Incluye la información del precio asociado a cada propiedad
    const propiedades = await Propiedad.findAll({
        where: { categoriaId: id },
        include: [
            { model: Precio, as: 'precio' }
        ]
    });

    // Renderiza la vista 'categoria' y pasa los datos obtenidos a la plantilla
    res.render('categoria', {
        pagina: `${categoria.nombre}s En Venta`, // Título de la página
        propiedades,                             // Propiedades obtenidas de la base de datos
        csrfToken: req.csrfToken(),              // Token CSRF para protección contra falsificación de solicitudes entre sitios
    });
}

// Función que maneja las solicitudes a rutas no encontradas
const noEncontrado = (req, res) => {
    // Renderiza la vista '404' y pasa el título de la página a la plantilla
    res.render('404', {
        pagina: '404 - Página No Encontrada',  // Título de la página
        csrfToken: req.csrfToken(),            // Token CSRF para protección contra falsificación de solicitudes entre sitios
    });
}

// Función asincrónica para manejar la búsqueda de propiedades según un término de búsqueda proporcionado por el usuario
const buscador = async (req, res) => {
    // Extraer el término de búsqueda del cuerpo de la solicitud
    const { termino } = req.body;

    // Verificar si el término de búsqueda está vacío o contiene solo espacios en blanco
    if (!termino.trim()) {
        // Si el término está vacío, redirigir al usuario a la página anterior
        return res.redirect('back');
    }

    // Realiza una consulta a la base de datos para encontrar propiedades que coincidan con el término de búsqueda
    const propiedades = await Propiedad.findAll({
        // Condiciones de búsqueda
        where: {
            // Buscar propiedades cuyo título contenga el término de búsqueda (sin distinción entre mayúsculas y minúsculas)
            titulo: {
                [Sequelize.Op.like]: `%${termino}%`
            },
            // Buscar propiedades cuya descripción contenga el término de búsqueda (sin distinción entre mayúsculas y minúsculas)
            descripcion: {
                [Sequelize.Op.like]: `%${termino}%`
            }
        },
        // Incluir datos relacionados del modelo Precio
        include: [
            { model: Precio, as: 'precio' }
        ],
    });

    // Renderiza la vista 'buscador' y pasa los datos obtenidos a la plantilla
    res.render('busqueda', {
        pagina: `Resultados de la Búsqueda: ${termino}`, // Título de la página
        propiedades,                                      // Propiedades obtenidas de la base de datos
        csrfToken: req.csrfToken(),                       // Token CSRF para protección contra falsificación de solicitudes entre sitios
    });
}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}