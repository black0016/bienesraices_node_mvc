import bcrypt from 'bcrypt';

const usuarios = [
    {
        nombre: 'Andres',
        email: 'andres@andres.com',
        confirmado: 1,
        password: 'Andres98',
        // password: bcrypt.hashSync('Andres98', 10)
    },
];

export default usuarios;