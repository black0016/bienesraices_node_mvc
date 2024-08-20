(function () {

    // Logical Or
    const lat = document.querySelector('#lat').value || 4.6073152;
    const lng = document.querySelector('#lng').value || -74.0946706;
    const mapa = L.map('mapa').setView([lat, lng], 15);
    let marker;

    // Utilizar Provider y Geocode
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Crear el pin de posicionamiento
    marker = new L.marker([lat, lng], {
        draggable: true, // Esto es para poder mover el pin
        autoPan: true, // Esto es para que a medida que se mueve el pin el mapa tambien se mueva
    })
        .addTo(mapa)

    // Detectar el movimiento del pin
    marker.on('moveend', function (e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        mapa.panTo(new L.latLng(posicion.lat, posicion.lng));

        // Obtener la información de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 15).run(function (erro, resultado) {
            marker.bindPopup(resultado.address.LongLabel); // Adiciona un popup al marcador del mapa con la direccion seleccionada
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })

})()