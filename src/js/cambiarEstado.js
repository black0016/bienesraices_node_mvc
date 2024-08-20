(function () {
    // Selecciona todos los botones con la clase 'cambiar-estado'
    const cambiarEstadoBotones = document.querySelectorAll('.cambiar-estado');
    // Obtiene el token CSRF del meta tag en el documento
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Añade un evento 'click' a cada botón para cambiar el estado de la propiedad
    cambiarEstadoBotones.forEach(boton => {
        boton.addEventListener('click', cambiarEstadoPropiedad);
    });

    // Función asíncrona que maneja el cambio de estado de la propiedad
    async function cambiarEstadoPropiedad(e) {
        // Obtiene el ID de la propiedad del dataset del botón clicado
        const { propiedadId: id } = e.target.dataset;

        try {
            // Construye la URL para la solicitud PUT
            const url = `/propiedades/${id}`;

            // Realiza la solicitud PUT para cambiar el estado de la propiedad
            const respuesta = await fetch(url, {
                method: 'PUT',
                headers: {
                    'CSRF-Token': token // Incluye el token CSRF en los headers
                }
            });

            // Obtiene el resultado de la respuesta en formato JSON
            const { resultado } = await respuesta.json();

            // Si el resultado es exitoso, cambia las clases y el texto del botón
            if (resultado) {
                if (e.target.classList.contains('bg-yellow-100')) {
                    // Cambia el estado a 'Publicado'
                    e.target.classList.remove('bg-yellow-100', 'text-yellow-800');
                    e.target.classList.add('bg-green-100', 'text-green-800');
                    e.target.textContent = 'Publicado';
                } else {
                    // Cambia el estado a 'No Publicado'
                    e.target.classList.remove('bg-green-100', 'text-green-800');
                    e.target.classList.add('bg-yellow-100', 'text-yellow-800');
                    e.target.textContent = 'No Publicado';
                }
            }
        } catch (error) {
            // Maneja cualquier error que ocurra durante la solicitud
            console.log('error', error);
        }
    }

})();