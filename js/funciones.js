var ancho_pantalla,alto_pantalla,alto_menu;

// Nueva función para mostrar el modal
function showModal(msg) {
    var modal = jQuery('#modal-mensaje');
    var modalTexto = jQuery('#modal-texto');

    modalTexto.text(msg);
    modal.css('display', 'flex'); // Usar flexbox para centrar
}

var acciones = {
    listo: function() {

        // LLAMADA A LA CORRECCIÓN INICIAL DE SCROLL
    if (window.location.hash) {
        acciones.corregirScrollInicial();
    }
        jQuery("#lacarta .boton-amarillo").click(acciones.clickbtnamarillo);

     jQuery("#lacarta .contenedor-cuadrado").click(acciones.obtenersrc);
        jQuery(".cabecera .menu a[href*='#']").click(acciones.irancla);

       // Inicialización de jQuery Validator
       jQuery("#formcontacto").validate({
        rules: {
            nombre: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            asunto: {
                required: true,
                minlength: 4 // Asumo una longitud mínima para el asunto
            },
            mensaje: {
                required: true,
                minlength: 10
            }

            
        },
        
        // Personalización de la posición del error (opcional)
        errorPlacement: function(error, element) {
            // Coloca el error fuera del <input> para no romper el CSS
            error.insertAfter(element); 
        },
        
        // Esto es crucial: evitamos que .validate() envíe el formulario.
        // El envío será controlado por la función validando de reCAPTCHA.
        submitHandler: function(form) {
            // Si llegamos aquí, el formulario es válido.
            // Sin embargo, NO hacemos form.submit() ni llamamos a acciones.enviar
            // porque reCAPTCHA ya está esperando la validación y enviará el token.
            return false; 
        },


    

        
    });

        jQuery(".cabecera .hamb").click(acciones.abrirMenuNav);

        jQuery(".titulo-acordion").click(acciones.abriracordion);

        jQuery(".saltarina").click(acciones.irsaltarina);

        jQuery('.ver-menu').click(acciones.abrirMenu);

        jQuery('.cerrar-menu').click(acciones.cerrarMenu);

        jQuery('.ver-local').click(acciones.abrirLocal);

        jQuery('.cerrar-local').click(acciones.cerrarLocal);

        new WOW().init();
    
    // Esto hace que los elementos con clase .wow empiecen a animarse
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }



    
    },


    enviar: function(token) { // <-- Ahora recibe el token
        // Mostrar un loader temporalmente si lo deseas
        
        var nombre = jQuery('#nombre').val().trim();
        var email = jQuery('#email').val().trim();
        var asunto = jQuery('#asunto').val().trim();
        var mensaje = jQuery('#mensaje').val().trim();

       

        // Ejecutar el envío AJAX con el token
        jQuery.ajax({
            url: 'registro.php',
            method: 'POST',
            data: { 
                nombre: nombre, 
                email: email, 
                asunto: asunto, 
                mensaje: mensaje,
                'g-recaptcha-response': token // <-- ¡CLAVE! Enviar el token a PHP
            },
            dataType: 'json'
        })
        .done(function(respuesta) {
            if (respuesta.tipo == 1) {
                showModal('¡Mensaje enviado con éxito! ' + (respuesta.mensaje || ''));
                jQuery('#formcontacto')[0].reset(); // <-- Limpia solo en éxito
            } else if (respuesta.tipo == 4) { // <-- MANEJA EL ERROR DUPLICADO
                showModal('Advertencia: ' + respuesta.mensaje);
            } else {
                // Maneja errores de validación (tipo 2) y errores de servidor (tipo 3)
                showModal('Error: ' + (respuesta.mensaje || 'Ocurrió un error inesperado.'));
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            // Esto solo se activa si PHP muere antes de hacer echo json_encode()
            showModal('Ocurrió un error en el servidor. Inténtalo de nuevo.');
        });
    },


   

    posicionScroll: 0,

    abrirMenu: function(e) {
       e.preventDefault();
       var menuId = jQuery(this).data('target');
       jQuery('#' + menuId).fadeIn();
       acciones.posicionScroll = jQuery(window).scrollTop();
       jQuery('body').addClass('menu-abierto').css({
        'position': 'fixed',
        'top': -acciones.posicionScroll + 'px',
        'left': '0',
        'right': '0'
    });
},


    cerrarMenu: function() {
       jQuery('.menu-desplegable').fadeOut();
       jQuery('body').removeClass('menu-abierto').css({
        'position': '',
        'top': '',
        'left': '',
        'right': ''
    });
       jQuery('html, body').scrollTop(acciones.posicionScroll);
},

abrirLocal: function(e) {
    e.preventDefault();
    var localId = jQuery(this).data('target');
    var modal = jQuery('#' + localId);

    modal.css('display', 'block');
    setTimeout(function() {
        modal.addClass('is-open');
    }, 10);
    
    
    acciones.posicionScroll = jQuery(window).scrollTop();

    jQuery('body').addClass('menu-abierto');
},

cerrarLocal: function() {
    var modal = jQuery('.modal-local');

    modal.removeClass('is-open');

    setTimeout(function() {
        modal.css('display', 'none'); 
    }, 300);
    
    
    jQuery('body').removeClass('menu-abierto');
    jQuery('html, body').scrollTop(acciones.posicionScroll);
},


    irsaltarina: function(){
       
    var altoCabecera = jQuery('.cabecera').outerHeight();
    var posicion = jQuery(this).closest("section").next("section").offset().top - altoCabecera;

    jQuery("html,body").animate({
        "scrollTop": posicion
    },800);
    
    },

    abriracordion:function(){

        if(jQuery(this).find("i").hasClass("fa-angle-up"))  {

            jQuery(this).find("i").removeClass("fa-angle-up");
        }else{
            jQuery(".titulo-acordion").find("i").removeClass("fa-angle-up");
            jQuery(this).find("i").addClass("fa-angle-up")
        }



        jQuery(this).next(".cuerpo-acordion").stop().slideToggle("slow",function(){

        });
    },

    abrirMenuNav : function(e){
        e.preventDefault();
        jQuery(".cabecera .menu").toggleClass("abierto");
        jQuery("body").toggleClass("abierto");
        jQuery(this).find("i").toggleClass("fa-xmark");
    },        


    obtenersrc: function(){
      //  var src = jQuery(this).attr("src");
       //console.log(src);

       //var html = jQuery(this).html();
       //console.log(html);

       var text = jQuery(this).find("h2").text();
       console.log(text);
    },

    cerrarMenuNav: function(){
        jQuery(".cabecera .menu").removeClass("abierto");
        jQuery("body").removeClass("abierto");
        jQuery(".cabecera .hamb").find("i").toggleClass("fa-xmark");
    },

   irancla: function(e){
        e.preventDefault();
       var ancla= this.hash;
       var url = jQuery(this).attr("href");
       if (jQuery(ancla).length > 0)
       {
        acciones.cerrarMenuNav();
        var altoCabecera = jQuery('.cabecera').outerHeight() + 20;        
        var posicionDestino = jQuery(ancla).offset().top - altoCabecera; 


        jQuery("html,body").animate({
            "scrollTop": posicionDestino 
            },800);
        }else{
            window.location.href = url;
        }
              
   },

   corregirScrollInicial: function() {
    var hash = window.location.hash; // Obtiene el ancla (ej: #locales)
    
    if (jQuery(hash).length > 0) { // Verifica que el elemento exista
        var altoCabecera = jQuery('.cabecera').outerHeight();
        // Mantenemos los 20px extra para el margen de seguridad
        var margenSeguridad = 20; 
        
        var posicionDestino = jQuery(hash).offset().top - altoCabecera - margenSeguridad;

        // Usamos .scrollTop() sin animación para un ajuste inmediato al cargar
        jQuery('html, body').scrollTop(posicionDestino);
    }
},


    clickbtnamarillo: function(e){
        e.preventDefault();
        var src = jQuery(this).closest(".contenedor-cuadrado").find("img").attr("src");
        console.log(src);
    },


    precarga: function(){

        jQuery(".preloader").fadeOut("slow");
        jQuery(".logo-latido").fadeOut("slow",function(){
            jQuery("body").toggleClass("abierto");
        });

        acciones.redimensionar();
    },


    redimensionar: function(){
        //ancho_pantalla = jQuery(window).width();
       // alto_pantalla = jQuery(window).height();

        //console.log(ancho_pantalla+ " - "+alto_pantalla);
        //alto_menu = jQuery(".cabecera").height();
       // alto_menu = jQuery(".cabecera").innerHeight();
        //console.log(alto_menu)

        ancho_pantalla = jQuery(window).width();

        if(ancho_pantalla < 768){
            alto_menu = jQuery(".cabecera").innerHeight();
            jQuery(".cabecera .menu").css({"padding-top":alto_menu,"padding-bottom":alto_menu});  
        }else{
            jQuery(".cabecera .menu").css({"padding-top":0,"padding-bottom":0});  
        }


    },

    scrollventana: function(){

    },
};

(function($){
  

  $(function(){
      
      // Eventos para cerrar el modal
      $('#modal-mensaje .cerrar-modal, #modal-mensaje .boton-amarillo').on('click', function() {
          $('#modal-mensaje').css('display', 'none');
      });

      $(window).on('click', function(event) {
          if ($(event.target).is('#modal-mensaje')) {
              $('#modal-mensaje').css('display', 'none');
          }
      });

  });
})(jQuery);

$(document).ready(function(){
    console.log("Inicializando Owl...");
    if($(".owl-carousel").length){
        console.log("Elementos encontrados:", $(".owl-carousel").length);
        $(".owl-carousel").owlCarousel({
            loop: true,
            margin: 20,
            nav: true,
            dots: true,
            autoplay: false,
            autoplayTimeout: 7000,
            autoplayHoverPause: true,
            items: 1,
            smartSpeed: 800, // Duración de la animación de transición en ms
            animateOut: 'fadeOut',
            animateIn: 'fadeIn'
        });
    } else {
        console.log("No se encontró ningún elemento con .owl-carousel");
    }
});


$(window).on('scroll', function () {
    // Comprueba si el ancho de la ventana es mayor a 768px
    if ($(window).width() > 768) {
      if ($(this).scrollTop() > 50) {
        $('.cabecera').addClass('scrolled');
      } else {
        $('.cabecera').removeClass('scrolled');
      }
    } else {
      // En pantallas pequeñas, asegúrate de que la clase "scrolled" se elimine
      $('.cabecera').removeClass('scrolled');
    }
  });
  

jQuery(document).ready(acciones.listo); 

jQuery(window).on("load",acciones.precarga);

jQuery(window).resize(acciones.redimensionar);

jQuery(window).scroll(acciones.scrollventana);

function validando(token){
    // 1. Verificar si el formulario es válido usando jQuery Validator
    if (jQuery("#formcontacto").valid()) {
        // Si es válido, llama a la función de envío AJAX
    acciones.enviar(token);
} else {
    // Si NO es válido, simplemente no hacemos nada.
    // jQuery Validator ya mostró los errores.
    // Y debemos resetear el token de reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset(); 
    }
}
}