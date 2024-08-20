import { unlink } from 'node:fs/promises';
import { validationResult } from 'express-validator'
import { exit } from 'node:process';

import { Categoria, Precio, Propiedad, Mensaje, Usuario } from '../models/index.js'
import { esVendedor, formatearFecha } from '../helpers/index.js';

// Función asincrónica para administrar las propiedades del usuario con paginación
const admin = async (req, res) => {
    // Extrae el parámetro 'pagina' de la consulta de la solicitud y lo asigna a la variable 'paginaActual'
    const { pagina: paginaActual } = req.query;

    // Define una expresión regular que verifica si la cadena completa es un solo dígito del 1 al 9
    const expresion = /^[1-9]$/;

    // Si 'paginaActual' no coincide con la expresión regular (es decir, no es un número válido),
    // redirige al usuario a la página '/mis-propiedades' con el parámetro 'pagina' establecido en 1
    if (!expresion.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1');
    }

    try {
        // Extrae el ID del usuario de la solicitud
        const { id } = req.usuario;

        // Limites y Offsets para el paginador

        // Define el número máximo de elementos que se mostrarán por página
        const limit = 2;

        // Calcula el desplazamiento (offset) para la consulta de la base de datos
        // 'paginaActual' es el número de la página actual
        // El offset se calcula multiplicando el número de la página actual por el límite y restando el límite
        const offset = (paginaActual * limit) - limit;

        // Realiza dos consultas a la base de datos en paralelo:
        // 1. Obtiene las propiedades del usuario con paginación e incluye las categorías, precios y mensajes asociados
        // 2. Cuenta el número total de propiedades del usuario
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: { usuarioId: id },
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio' },
                    { model: Mensaje, as: 'mensajes' }
                ]
            }),
            Propiedad.count({ where: { usuarioId: id } })
        ]);

        // Renderiza la vista 'propiedades/admin' con los datos proporcionados
        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades', // Título de la página
            propiedades, // Lista de propiedades a mostrar
            csrfToken: req.csrfToken(), // Token CSRF para seguridad
            paginas: Math.ceil(total / limit), // Número total de páginas calculado a partir del total de elementos y el límite por página
            paginaActual: Number(paginaActual), // Página actual convertida a número
            total, // Total de elementos
            offset, // Desplazamiento para la paginación
            limit, // Límite de elementos por página
        });
    } catch (error) {
        // En caso de error, lo registra en la consola y termina el proceso
        console.log('error', error);
        exit(1);
    }
}

// Función asincrónica para renderizar la página de creación de una nueva propiedad
const crear = async (req, res) => {
    // Consultar modelos de categorías y precios en paralelo
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(), // Obtener todas las categorías
        Precio.findAll() // Obtener todos los precios
    ]);

    // Renderizar la página de creación de propiedad con los datos obtenidos
    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad', // Título de la página
        csrfToken: req.csrfToken(), // Token CSRF para la seguridad del formulario
        categorias, // Lista de categorías
        precios, // Lista de precios
        datos: {} // Datos iniciales vacíos para el formulario
    });
}

// Función asincrónica para guardar una nueva propiedad
const guardar = async (req, res) => {
    // Validación de los datos de la solicitud
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        // Consultar modelos de categorías y precios en paralelo si hay errores de validación
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        // Renderizar la página de creación con los errores y datos ingresados
        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    // Extraer los datos de la solicitud
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

    // Obtener el ID del usuario que está creando la propiedad (viene de la protección de rutas)
    const { id: usuarioId } = req.usuario;

    try {
        // Crear el registro de la propiedad en la base de datos
        const propiedadGuardadas = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: '' // Inicialmente sin imagen
        });

        // Extraer el ID de la propiedad recién creada
        const { id } = propiedadGuardadas;

        // Redirigir al usuario a la página para agregar una imagen a la propiedad
        res.redirect(`/propiedades/agregar-imagen/${id}`);

    } catch (error) {
        // Manejo de errores
        console.log('error', error);
        exit(1); // Salir del proceso con un error
    }
}

// Función asincrónica para renderizar la página de agregar imagen a una propiedad
const agregarImagen = async (req, res) => {
    // Extraer el ID de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Buscar la propiedad en la base de datos por su ID
    const propiedad = await Propiedad.findByPk(id);

    // Si la propiedad no existe, redirigir al usuario a la página de "mis propiedades"
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        // Si la propiedad ya está publicada, redirigir al usuario a la página de "mis propiedades"
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        // Si la propiedad no pertenece al usuario, redirigir al usuario a la página de "mis propiedades"
        return res.redirect('/mis-propiedades');
    }

    // Renderizar la página de agregar imagen con los datos de la propiedad
    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`, // Título de la página
        csrfToken: req.csrfToken(), // Token CSRF para la seguridad del formulario
        propiedad // Datos de la propiedad
    });
}

// Función asincrónica para almacenar la imagen de una propiedad y publicarla
const almacenarImagen = async (req, res, next) => {
    // Validar que la propiedad exista en la base de datos
    const { id } = req.params;
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        // Si la propiedad no existe, redirigir al usuario a la página de "mis propiedades"
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        // Si la propiedad ya está publicada, redirigir al usuario a la página de "mis propiedades"
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        // Si la propiedad no pertenece al usuario, redirigir al usuario a la página de "mis propiedades"
        return res.redirect('/mis-propiedades');
    }

    try {
        // Almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename; // Asignar el nombre del archivo de la imagen a la propiedad
        propiedad.publicado = 1; // Marcar la propiedad como publicada

        // Guardar los cambios en la base de datos
        await propiedad.save();

        // Continuar con el siguiente middleware
        next();
    } catch (error) {
        // Manejo de errores
        console.log('error', error);
    }
}

// Función asincrónica para renderizar la página de edición de una propiedad
const editar = async (req, res) => {
    // Extraer el ID de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Buscar la propiedad en la base de datos por su ID
    const propiedad = await Propiedad.findByPk(id);

    // Si la propiedad no existe, redirigir al usuario a la página de "mis propiedades"
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Verificar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Consultar los modelos de categorías y precios en paralelo
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    // Renderizar la página de edición con los datos de la propiedad, categorías y precios
    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    });
}

// Función asincrónica para guardar los cambios en una propiedad
const guardarCambios = async (req, res) => {
    // Validación de los datos de la solicitud
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        // Consultar modelo de precio y categorías si hay errores de validación
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        // Renderizar la página de edición con los errores y datos ingresados
        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    // Validar que la propiedad exista en la base de datos
    const { id } = req.params;
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Reescribir el objeto propiedad con los nuevos datos y actualizarlo en la base de datos
    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body;

        // Reescribir el objeto propiedad con los nuevos datos
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        });

        // Guardar la información del objeto reescrito en la base de datos
        await propiedad.save();

        // Redirigir al usuario a la página de "mis propiedades"
        res.redirect('/mis-propiedades');
    } catch (error) {
        // Manejo de errores
        console.log('error', error);
    }
}

// Función asincrónica para eliminar una propiedad
const eliminar = async (req, res) => {
    // Extraer el ID de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Buscar la propiedad en la base de datos por su ID
    const propiedad = await Propiedad.findByPk(id);

    // Si la propiedad no existe, redirigir al usuario a la página de "mis propiedades"
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Verificar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Eliminar la imagen asociada a la propiedad del sistema de archivos
    await unlink(`public/uploads/${propiedad.imagen}`);
    console.log(`Se eliminó la imagen ${propiedad.imagen}`);

    // Eliminar la propiedad de la base de datos
    await propiedad.destroy();

    // Redirigir al usuario a la página de "mis propiedades"
    res.redirect('/mis-propiedades');
}

// Función asincrónica para cambiar el estado de una propiedad
const cambiarEstado = async (req, res) => {
    // Extraer el ID de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Buscar la propiedad en la base de datos por su ID
    const propiedad = await Propiedad.findByPk(id);

    // Si la propiedad no existe, redirigir al usuario a la página de "mis propiedades"
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Verificar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Cambiar el estado de la propiedad

    // Invierte el estado actual de la propiedad 'publicado' del objeto 'propiedad'
    // Si 'publicado' es true, lo cambia a false
    // Si 'publicado' es false, lo cambia a true
    propiedad.publicado = !propiedad.publicado;
    // Guardar el cambio en la base de datos
    await propiedad.save();
    // Enviar una respuesta JSON con el resultado
    res.json({
        resultado: true,
    });
}

// Función asíncrona que maneja la solicitud para mostrar una propiedad específica
const mostrarPropiedad = async (req, res) => {
    // Extrae el id de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Busca la propiedad en la base de datos por su clave primaria (id)
    // Incluye la información de la categoría y el precio asociados a la propiedad
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as: 'precio' }
        ]
    });

    // Si la propiedad no existe o no esta publicada, redirige a la página de error 404
    if (!propiedad || !propiedad.publicado) {
        return res.redirect('/404');
    }

    // Renderiza la vista de la propiedad y pasa los datos obtenidos a la plantilla
    res.render('propiedades/mostrar', {
        propiedad,                // Propiedad obtenida de la base de datos
        pagina: propiedad.titulo, // Título de la página basado en el título de la propiedad
        csrfToken: req.csrfToken(), // Token CSRF para proteger contra ataques CSRF
        usuario: req.usuario,       // Datos del usuario autenticado
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId) // Verifica si el usuario es el vendedor de la propiedad
    });
}

// Función asíncrona que maneja el envío de un mensaje relacionado con una propiedad
const enviarMensaje = async (req, res) => {
    // Extrae el id de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Busca la propiedad en la base de datos por su clave primaria (id)
    // Incluye la información de la categoría y el precio asociados a la propiedad
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as: 'precio' }
        ]
    });

    // Si la propiedad no existe, redirige a la página de error 404
    if (!propiedad) {
        return res.redirect('/404');
    }

    // Validación de los datos de la solicitud
    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        return res.render('propiedades/mostrar', {
            propiedad,                // Propiedad obtenida de la base de datos
            pagina: propiedad.titulo, // Título de la página basado en el título de la propiedad
            csrfToken: req.csrfToken(), // Token CSRF para proteger contra ataques CSRF
            usuario: req.usuario,       // Datos del usuario autenticado
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId), // Verifica si el usuario es el vendedor de la propiedad
            errores: resultado.array(), // Errores de validación
        });
    }

    // Extrae el mensaje del cuerpo de la solicitud
    const { mensaje } = req.body;
    // Extrae el ID de la propiedad de los parámetros de la solicitud
    const { id: propiedadId } = req.params;
    // Extrae el ID del usuario de la solicitud
    const { id: usuarioId } = req.usuario;

    // Crea un nuevo mensaje en la base de datos con los datos extraídos
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    });

    // Renderiza la vista 'propiedades/mostrar' con los datos necesarios
    // res.render('propiedades/mostrar', {
    //     propiedad,                // Propiedad obtenida de la base de datos
    //     pagina: propiedad.titulo, // Título de la página basado en el título de la propiedad
    //     csrfToken: req.csrfToken(), // Token CSRF para proteger contra ataques CSRF
    //     usuario: req.usuario,       // Datos del usuario autenticado
    //     esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId), // Verifica si el usuario es el vendedor de la propiedad
    //     errores: resultado.array(), // Errores de validación
    //     enviado: true // Indica que el mensaje fue enviado con éxito
    // });

    res.redirect('/'); // Redirige al usuario a la página de inicio
}

const verMensajes = async (req, res) => {
    // Extraer el ID de la propiedad de los parámetros de la solicitud
    const { id } = req.params;

    // Buscar la propiedad en la base de datos por su ID
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Mensaje, as: 'mensajes',
                include: [
                    { model: Usuario.scope('eliminarPassword'), as: 'usuario' }
                ]
            }
        ]
    });

    // Si la propiedad no existe, redirigir al usuario a la página de "mis propiedades"
    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Verificar que la propiedad pertenece al usuario que está haciendo la solicitud
    if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes', // Título de la página
        mensajes: propiedad.mensajes, // Lista de mensajes asociados a la propiedad
        formatearFecha, // Función para formatear la fecha
    })
}

// Exportar las funciones del controlador de propiedades
export {
    admin,             // Función para administrar las propiedades del usuario con paginación
    crear,             // Función para renderizar la página de creación de una nueva propiedad
    guardar,           // Función para guardar una nueva propiedad
    agregarImagen,     // Función para renderizar la página de agregar imagen a una propiedad
    almacenarImagen,   // Función para almacenar la imagen de una propiedad y publicarla
    editar,            // Función para renderizar la página de edición de una propiedad
    guardarCambios,    // Función para guardar los cambios en una propiedad
    eliminar,          // Función para eliminar una propiedad
    cambiarEstado,     // Función para cambiar el estado de una propiedad
    mostrarPropiedad,  // Función para mostrar los detalles de una propiedad
    enviarMensaje,     // Función para enviar un mensaje a un usuario
    verMensajes        // Función para ver los mensajes de un usuario
}