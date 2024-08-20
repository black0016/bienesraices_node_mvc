/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapaInicio.js":
/*!******************************!*\
  !*** ./src/js/mapaInicio.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function () {\r\n    // Define la latitud y longitud inicial para centrar el mapa\r\n    const lat = 4.6073152;\r\n    const lng = -74.0946706;\r\n\r\n    // Crea un mapa centrado en las coordenadas especificadas y con un nivel de zoom de 9\r\n    const mapa = L.map('mapa-inicio').setView([lat, lng], 9);\r\n\r\n    // Crea un grupo de marcadores y lo añade al mapa\r\n    let markers = new L.FeatureGroup().addTo(mapa);\r\n\r\n    // Inicializa un array vacío para almacenar las propiedades\r\n    let propiedades = [];\r\n\r\n    // Define un objeto para almacenar los filtros de categoría y precio\r\n    const filtros = {\r\n        categoria: '', // Filtro de categoría inicializado como cadena vacía\r\n        precio: '',    // Filtro de precio inicializado como cadena vacía\r\n    };\r\n\r\n    // Selecciona el elemento del DOM con el id 'categorias' y lo asigna a la variable categoriasSelect\r\n    const categoriasSelect = document.querySelector('#categorias');\r\n    // Selecciona el elemento del DOM con el id 'precios' y lo asigna a la variable preciosSelect\r\n    const preciosSelect = document.querySelector('#precios');\r\n\r\n    // Añade una capa de mosaico al mapa utilizando OpenStreetMap como proveedor de tiles\r\n    // La URL especifica el formato de los tiles y la atribución proporciona crédito a OpenStreetMap\r\n    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\r\n        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\r\n    }).addTo(mapa);\r\n\r\n\r\n    // Agrega un evento 'change' al elemento 'categoriasSelect'\r\n    // Cuando el valor seleccionado cambia, actualiza el filtro de categoría y llama a la función 'filtrarPropiedades'\r\n    categoriasSelect.addEventListener('change', e => {\r\n        // Actualiza el filtro de categoría con el valor seleccionado, convirtiéndolo a número\r\n        filtros.categoria = +e.target.value;\r\n        // Llama a la función para filtrar las propiedades basándose en los filtros actualizados\r\n        filtrarPropiedades();\r\n    });\r\n\r\n    // Agrega un evento 'change' al elemento 'preciosSelect'\r\n    // Cuando el valor seleccionado cambia, actualiza el filtro de precio y llama a la función 'filtrarPropiedades'\r\n    preciosSelect.addEventListener('change', e => {\r\n        // Actualiza el filtro de precio con el valor seleccionado, convirtiéndolo a número\r\n        filtros.precio = +e.target.value;\r\n        // Llama a la función para filtrar las propiedades basándose en los filtros actualizados\r\n        filtrarPropiedades();\r\n    });\r\n\r\n    const obtenerPropiedades = async () => {\r\n        try {\r\n            // Define la URL de la API desde donde se obtendrán las propiedades\r\n            const url = '/api/propiedades';\r\n            // Realiza una solicitud fetch a la URL especificada y espera la respuesta\r\n            const respuesta = await fetch(url);\r\n            // Convierte la respuesta en formato JSON y la almacena en la variable 'propiedades'\r\n            propiedades = await respuesta.json();\r\n            // Muestra las propiedades en el mapa\r\n            mostrarPropiedades(propiedades);\r\n        } catch (error) {\r\n            // En caso de error, lo registra en la consola\r\n            console.log('error', error);\r\n        }\r\n    };\r\n\r\n    const mostrarPropiedades = propiedades => {\r\n        // Elimina todos los marcadores\r\n        markers.clearLayers();\r\n\r\n        // Itera sobre cada propiedad en la lista de propiedades\r\n        propiedades.forEach(propiedad => {\r\n            // Crea un marcador en el mapa usando las coordenadas de la propiedad\r\n            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {\r\n                autoPan: true // Habilita el auto-pan para centrar el mapa en el marcador\r\n            })\r\n                // Añade el marcador al mapa y le asocia un popup con información de la propiedad\r\n                .addTo(mapa)\r\n                .bindPopup(`\r\n                    <p class=\"text-indigo-600 font-bold\"> ${propiedad?.categoria.nombre} </p>\r\n                    <h1 class=\"text-xl font-extrabold uppercase my-2\"> ${propiedad?.titulo} </h1>\r\n                    <img src=\"/uploads/${propiedad?.imagen}\" alt=\"Imagen de la propiedad ${propiedad?.titulo}\">\r\n                    <p class=\"text-gray-600 font-bold\"> ${propiedad?.precio.nombre} </p>\r\n                    <a href=\"/propiedad/${propiedad?.id}\" class=\"bg-indigo-600 block p-2 text-center font-bold uppercase\">Ver Propiedad</a>\r\n                `)\r\n                // Añade un evento para abrir el popup y ajustar la vista del mapa cuando se hace clic\r\n                .on('click', function () {\r\n                    // Abre el popup asociado al marcador\r\n                    this.openPopup();\r\n                    // Obtiene el popup asociado al marcador\r\n                    const popup = this.getPopup();\r\n                    // Obtiene la altura del contenedor del popup\r\n                    const popupHeight = popup._container.offsetHeight;\r\n                    // Obtiene las coordenadas del marcador\r\n                    const markerLatLng = this.getLatLng();\r\n                    // Ajusta las coordenadas del marcador para que el popup esté completamente visible\r\n                    // Resta la mitad de la altura del popup a la coordenada Y del marcador\r\n                    const adjustedLatLng = mapa.layerPointToLatLng(\r\n                        mapa.latLngToLayerPoint(markerLatLng).subtract([0, popupHeight / 2])\r\n                    );\r\n                    // Centra el mapa en las coordenadas ajustadas con animación\r\n                    mapa.panTo(adjustedLatLng, { animate: true });\r\n                });\r\n\r\n            // Añade el marcador a la capa de marcadores\r\n            markers.addLayer(marker);\r\n        });\r\n    };\r\n\r\n    // Función principal que filtra las propiedades basándose en la categoría y el precio\r\n    const filtrarPropiedades = () => {\r\n        // Primero filtra las propiedades por categoría, luego aplica el filtro de precio sobre el resultado del primer filtro\r\n        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);\r\n        // Muestra las propiedades filtradas en el mapa\r\n        mostrarPropiedades(resultado);\r\n    };\r\n\r\n    // Función que filtra las propiedades por categoría\r\n    // Si hay un filtro de categoría, compara el id de la categoría de la propiedad con el filtro\r\n    // Si no hay filtro de categoría, devuelve la propiedad sin filtrar\r\n    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;\r\n\r\n    // Función que filtra las propiedades por precio\r\n    // Si hay un filtro de precio, compara el id del precio de la propiedad con el filtro\r\n    // Si no hay filtro de precio, devuelve la propiedad sin filtrar\r\n    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;\r\n\r\n    // Inicializa la función para obtener las propiedades\r\n    obtenerPropiedades();\r\n})();\n\n//# sourceURL=webpack://bienesraices_mvc/./src/js/mapaInicio.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapaInicio.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;