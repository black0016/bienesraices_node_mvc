import express from 'express';
import { body } from 'express-validator';

import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, eliminar, cambiarEstado, mostrarPropiedad, enviarMensaje, verMensajes } from '../controllers/propiedadController.js';
import protegerRuta from '../middleware/protegerRuta.js';
import upload from '../middleware/subirImagen.js';
import identificarUsuario from '../middleware/identificarUsuario.js';

const router = express.Router();

// Ruta para obtener las propiedades del usuario
router.get('/mis-propiedades', protegerRuta, admin);

// Ruta para mostrar el formulario de creación de propiedades
router.get('/propiedades/crear', protegerRuta, crear);

// Ruta para manejar el envío del formulario de creación de propiedades
router.post('/propiedades/crear', protegerRuta,
    // Validaciones para los campos del formulario
    body('titulo').notEmpty().withMessage('El Titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ max: 250 }).withMessage('La descripcion no puede superar los 250 caracteres'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños(WC)'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar // Controlador para guardar la propiedad
);

// Ruta para mostrar el formulario de agregar imagen a una propiedad
router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen);

// Ruta para manejar el envío del formulario de agregar imagen
router.post('/propiedades/agregar-imagen/:id', protegerRuta, upload.single('imagen'), almacenarImagen);

// Ruta para mostrar el formulario de edición de propiedades
router.get('/propiedades/editar/:id', protegerRuta, editar);

// Ruta para manejar el envío del formulario de edición de propiedades
router.post('/propiedades/editar/:id', protegerRuta,
    // Validaciones para los campos del formulario
    body('titulo').notEmpty().withMessage('El Titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ max: 250 }).withMessage('La descripcion no puede superar los 250 caracteres'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños(WC)'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardarCambios // Controlador para guardar los cambios de la propiedad
);

// Ruta para manejar la eliminación de una propiedad
router.post('/propiedades/eliminar/:id', protegerRuta, eliminar);

// Ruta para manejar el cambio de estado de una propiedad
router.put('/propiedades/:id', protegerRuta, cambiarEstado);

// Area publica

// Ruta para mostrar una propiedad específica basada en su ID
router.get('/propiedad/:id', identificarUsuario, mostrarPropiedad);

// Almacenar los mensajes

// Ruta para manejar el envío de un mensaje relacionado con una propiedad específica basada en su ID
router.post('/propiedad/:id',
    identificarUsuario, // Middleware para identificar al usuario
    body('mensaje')
        .notEmpty().withMessage('El mensaje es obligatorio') // Validación para asegurar que el mensaje no esté vacío
        .isLength({ min: 10, max: 250 }).withMessage('El mensaje no puede superar los 250 caracteres ni ser menor a 10'), // Validación para asegurar que el mensaje tenga entre 10 y 250 caracteres
    enviarMensaje // Controlador para enviar el mensaje
);

// Ruta para ver los mensajes relacionados con una propiedad específica basada en su ID
router.get('/mensajes/:id', protegerRuta, verMensajes);

export default router;