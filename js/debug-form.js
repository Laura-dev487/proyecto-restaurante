console.log("Archivo debug-form.js cargado correctamente");

// Seleccionamos el formulario y el botón
const form = document.getElementById('formcontacto');
const boton = form.querySelector('button[type="submit"]');

if (form) {
    console.log("Formulario encontrado:", form);
} else {
    console.error("No se encontró el formulario con id #formcontacto");
}

if (boton) {
    console.log("Botón encontrado:", boton);
} else {
    console.error("No se encontró el botón submit dentro del formulario");
}

// Escuchar el envío del formulario
form.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Formulario enviado, datos:");

    // Mostrar datos capturados
    const datos = new FormData(form);
    for (let [campo, valor] of datos.entries()) {
        console.log(`${campo}: ${valor}`);
    }

    // Mensaje de prueba
    console.log("Aquí iría la función para mostrar el mensaje de alerta");
});
