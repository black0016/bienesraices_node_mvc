import { exit } from 'node:process';

import categorias from './categorias.js';
import precios from './precios.js';
import usuarios from './usuarios.js';
import { Categoria, Precio, Usuario } from '../models/index.js';

import db from '../config/db.js';

const importarDatos = async () => {
    try {
        // Autenticar en la base de datos
        await db.authenticate();
        // Generar las columnas de la tabla en la base de datos
        await db.sync();
        // Insertar los datos en la tabla de la base de datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios, { individualHooks: true })
        ]);

        console.log('Datos Importados Correctamente');
        exit();
    } catch (error) {
        console.log('error', error);
        exit(1);
    }
}

const eliminarDatos = async () => {
    try {
        // 1. Manera de eliminar los datos de la base de datos
        // await Promise.all([
        //     Categoria.destroy({
        //         where: {},
        //         truncate: true
        //     }),
        //     Precio.destroy({
        //         where: {},
        //         truncate: true
        //     })
        // ]);

        // 2. Manera de eliminar los datos de la base de datos
        await db.sync({
            force: true
        });
        console.log('Datos Eliminados Correctamente');
        exit();
    } catch (error) {
        console.log('error', error);
        exit(1);
    }
}

if (process.argv[2] === "-i") {
    importarDatos();
}

if (process.argv[2] === "-e") {
    eliminarDatos();
}