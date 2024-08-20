(function () {
    // Define la latitud y longitud inicial para centrar el mapa
    const lat = 4.6073152;
    const lng = -74.0946706;

    // Crea un mapa centrado en las coordenadas especificadas y con un nivel de zoom de 9
    const mapa = L.map('mapa-inicio').setView([lat, lng], 9);

    // Crea un grupo de marcadores y lo añade al mapa
    let markers = new L.FeatureGroup().addTo(mapa);

    // Inicializa un array vacío para almacenar las propiedades
    let propiedades = [];

    // Define un objeto para almacenar los filtros de categoría y precio
    const filtros = {
        categoria: '', // Filtro de categoría inicializado como cadena vacía
        precio: '',    // Filtro de precio inicializado como cadena vacía
    };

    // Selecciona el elemento del DOM con el id 'categorias' y lo asigna a la variable categoriasSelect
    const categoriasSelect = document.querySelector('#categorias');
    // Selecciona el elemento del DOM con el id 'precios' y lo asigna a la variable preciosSelect
    const preciosSelect = document.querySelector('#precios');

    // Añade una capa de mosaico al mapa utilizando OpenStreetMap como proveedor de tiles
    // La URL especifica el formato de los tiles y la atribución proporciona crédito a OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


    // Agrega un evento 'change' al elemento 'categoriasSelect'
    // Cuando el valor seleccionado cambia, actualiza el filtro de categoría y llama a la función 'filtrarPropiedades'
    categoriasSelect.addEventListener('change', e => {
        // Actualiza el filtro de categoría con el valor seleccionado, convirtiéndolo a número
        filtros.categoria = +e.target.value;
        // Llama a la función para filtrar las propiedades basándose en los filtros actualizados
        filtrarPropiedades();
    });

    // Agrega un evento 'change' al elemento 'preciosSelect'
    // Cuando el valor seleccionado cambia, actualiza el filtro de precio y llama a la función 'filtrarPropiedades'
    preciosSelect.addEventListener('change', e => {
        // Actualiza el filtro de precio con el valor seleccionado, convirtiéndolo a número
        filtros.precio = +e.target.value;
        // Llama a la función para filtrar las propiedades basándose en los filtros actualizados
        filtrarPropiedades();
    });

    const obtenerPropiedades = async () => {
        try {
            // Define la URL de la API desde donde se obtendrán las propiedades
            const url = '/api/propiedades';
            // Realiza una solicitud fetch a la URL especificada y espera la respuesta
            const respuesta = await fetch(url);
            // Convierte la respuesta en formato JSON y la almacena en la variable 'propiedades'
            propiedades = await respuesta.json();
            // Muestra las propiedades en el mapa
            mostrarPropiedades(propiedades);
        } catch (error) {
            // En caso de error, lo registra en la consola
            console.log('error', error);
        }
    };

    const mostrarPropiedades = propiedades => {
        // Elimina todos los marcadores
        markers.clearLayers();

        // Itera sobre cada propiedad en la lista de propiedades
        propiedades.forEach(propiedad => {
            // Crea un marcador en el mapa usando las coordenadas de la propiedad
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true // Habilita el auto-pan para centrar el mapa en el marcador
            })
                // Añade el marcador al mapa y le asocia un popup con información de la propiedad
                .addTo(mapa)
                .bindPopup(`
                    <p class="text-indigo-600 font-bold"> ${propiedad?.categoria.nombre} </p>
                    <h1 class="text-xl font-extrabold uppercase my-2"> ${propiedad?.titulo} </h1>
                    <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad?.titulo}">
                    <p class="text-gray-600 font-bold"> ${propiedad?.precio.nombre} </p>
                    <a href="/propiedad/${propiedad?.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase">Ver Propiedad</a>
                `)
                // Añade un evento para abrir el popup y ajustar la vista del mapa cuando se hace clic
                .on('click', function () {
                    // Abre el popup asociado al marcador
                    this.openPopup();
                    // Obtiene el popup asociado al marcador
                    const popup = this.getPopup();
                    // Obtiene la altura del contenedor del popup
                    const popupHeight = popup._container.offsetHeight;
                    // Obtiene las coordenadas del marcador
                    const markerLatLng = this.getLatLng();
                    // Ajusta las coordenadas del marcador para que el popup esté completamente visible
                    // Resta la mitad de la altura del popup a la coordenada Y del marcador
                    const adjustedLatLng = mapa.layerPointToLatLng(
                        mapa.latLngToLayerPoint(markerLatLng).subtract([0, popupHeight / 2])
                    );
                    // Centra el mapa en las coordenadas ajustadas con animación
                    mapa.panTo(adjustedLatLng, { animate: true });
                });

            // Añade el marcador a la capa de marcadores
            markers.addLayer(marker);
        });
    };

    // Función principal que filtra las propiedades basándose en la categoría y el precio
    const filtrarPropiedades = () => {
        // Primero filtra las propiedades por categoría, luego aplica el filtro de precio sobre el resultado del primer filtro
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);
        // Muestra las propiedades filtradas en el mapa
        mostrarPropiedades(resultado);
    };

    // Función que filtra las propiedades por categoría
    // Si hay un filtro de categoría, compara el id de la categoría de la propiedad con el filtro
    // Si no hay filtro de categoría, devuelve la propiedad sin filtrar
    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;

    // Función que filtra las propiedades por precio
    // Si hay un filtro de precio, compara el id del precio de la propiedad con el filtro
    // Si no hay filtro de precio, devuelve la propiedad sin filtrar
    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;

    // Inicializa la función para obtener las propiedades
    obtenerPropiedades();
})();