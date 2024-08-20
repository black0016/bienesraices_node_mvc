// Función que verifica si un usuario es el propietario de una propiedad
const esVendedor = (usuarioId, propiedadUsuarioId) => {
    // Compara el ID del usuario con el ID del propietario de la propiedad
    return usuarioId === propiedadUsuarioId;
};

// Función para formatear una fecha a un formato legible en español
const formatearFecha = fecha => {
    // Convierte la fecha proporcionada a un objeto Date y luego a una cadena ISO, tomando solo la parte de la fecha (YYYY-MM-DD)
    const nuevaFecha = new Date(fecha).toISOString().slice(0, 10);

    // Opciones para formatear la fecha en español
    const opciones = {
        weekday: 'long',  // Nombre completo del día de la semana
        year: 'numeric',  // Año con cuatro dígitos
        month: 'long',    // Nombre completo del mes
        day: 'numeric',   // Día del mes con uno o dos dígitos
    }

    // Convierte la nueva fecha a una cadena de texto en español con el formato especificado en 'opciones'
    return new Date(nuevaFecha).toLocaleDateString('es-ES', opciones);
}

export {
    esVendedor,
    formatearFecha,
};