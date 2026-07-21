var ancho_pantalla, alto_pantalla, alto_menu;

// Función global para mostrar el modal de mensajes
function showModal(msg) {
    var modal = jQuery('#modal-mensaje');
    var modalTexto = jQuery('#modal-texto');

    modalTexto.text(msg);
    modal.css('display', 'flex'); // Usar flexbox para centrar
}

var acciones = {
    posicionScroll: 0,

    listo: function() {
        // Corrección inicial de scroll si se ingresa con un ancla (#) en la URL
        if (window.location.hash) {
            acciones.corregirScrollInicial();
        }

        // Eventos e interacciones de la carta
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
                    minlength: 4
                },
                mensaje: {
                    required: true,
                    minlength: 10
                }
            },
            
            errorPlacement: function(error, element) {
                // Coloca el error fuera del input para no romper el layout CSS
                error.insertAfter(element); 
            },
            
            submitHandler: function(form) {
                // Previene el envío HTML por defecto; reCAPTCHA llamará a validando(token)
                return false; 
            }
        });

        // Eventos de Navegación, Acordeones y Modales
        jQuery(".cabecera .hamb").click(acciones.abrirMenuNav);
        jQuery(".titulo-acordion").click(acciones.abriracordion);
        jQuery(".saltarina").click(acciones.irsaltarina);
        jQuery('.ver-menu').click(acciones.abrirMenu);
        jQuery('.cerrar-menu').click(acciones.cerrarMenu);
        jQuery('.ver-local').click(acciones.abrirLocal);
        jQuery('.cerrar-local').click(acciones.cerrarLocal);

        // Cierre de modal con clic afuera o en botón cerrar
        jQuery('#modal-mensaje .cerrar-modal, #modal-mensaje .boton-amarillo').on('click', function() {
            jQuery('#modal-mensaje').css('display', 'none');
        });

        jQuery(window).on('click', function(event) {
            if (jQuery(event.target).is('#modal-mensaje')) {
                jQuery('#modal-mensaje').css('display', 'none');
            }
        });

        // Inicialización de Owl Carousel
        if (jQuery(".owl-carousel").length) {
            jQuery(".owl-carousel").owlCarousel({
                loop: true,
                margin: 20,
                nav: true,
                dots: true,
                autoplay: false,
                autoplayTimeout: 7000,
                autoplayHoverPause: true,
                items: 1,
                smartSpeed: 800,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn'
            });
        }

        // Animaciones WOW.js (verificación segura)
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
    },

    enviar: function(token) {
        var nombre = jQuery('#nombre').val().trim();
        var email = jQuery('#email').val().trim();
        var asunto = jQuery('#asunto').val().trim();
        var mensaje = jQuery('#mensaje').val().trim();

        // Envío AJAX a PHP con el token de reCAPTCHA
        jQuery.ajax({
            url: 'registro.php',
            method: 'POST',
            data: { 
                nombre: nombre, 
                email: email, 
                asunto: asunto, 
                mensaje: mensaje,
                'g-recaptcha-response': token
            },
            dataType: 'json'
        })
        .done(function(respuesta) {
            if (respuesta.tipo == 1) {
                showModal('¡Mensaje enviado con éxito! ' + (respuesta.mensaje || ''));
                jQuery('#formcontacto')[0].reset(); 
            } else if (respuesta.tipo == 4) {
                showModal('Advertencia: ' + respuesta.mensaje);
            } else {
                showModal('Error: ' + (respuesta.mensaje || 'Ocurrió un error inesperado.'));
            }
        })
        .fail(function() {
            showModal('Ocurrió un error en el servidor. Inténtalo de nuevo.');
        })
        .always(function() {
            // Se resetea el token para permitir reenvíos en la misma sesión
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }
        });
    },

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

    irsaltarina: function() {
        var altoCabecera = jQuery('.cabecera').outerHeight();
        var posicion = jQuery(this).closest("section").next("section").offset().top - altoCabecera;

        jQuery("html,body").animate({
            "scrollTop": posicion
        }, 800);
    },

    abriracordion: function() {
        if (jQuery(this).find("i").hasClass("fa-angle-up")) {
            jQuery(this).find("i").removeClass("fa-angle-up");
        } else {
            jQuery(".titulo-acordion").find("i").removeClass("fa-angle-up");
            jQuery(this).find("i").addClass("fa-angle-up");
        }

        jQuery(this).next(".cuerpo-acordion").stop().slideToggle("slow");
    },

    abrirMenuNav: function(e) {
        e.preventDefault();
        jQuery(".cabecera .menu").toggleClass("abierto");
        jQuery("body").toggleClass("abierto");
        jQuery(this).find("i").toggleClass("fa-xmark");
    },        

    cerrarMenuNav: function() {
        jQuery(".cabecera .menu").removeClass("abierto");
        jQuery("body").removeClass("abierto");
        // Aseguramos remover la clase en lugar de toggle para evitar desfases
        jQuery(".cabecera .hamb").find("i").removeClass("fa-xmark");
    },

    irancla: function(e) {
        e.preventDefault();
        var ancla = this.hash;
        var url = jQuery(this).attr("href");

        if (jQuery(ancla).length > 0) {
            acciones.cerrarMenuNav();
            var altoCabecera = jQuery('.cabecera').outerHeight() + 20;        
            var posicionDestino = jQuery(ancla).offset().top - altoCabecera; 

            jQuery("html,body").animate({
                "scrollTop": posicionDestino 
            }, 800);
        } else {
            window.location.href = url;
        }
    },

    corregirScrollInicial: function() {
        var hash = window.location.hash;
        
        if (jQuery(hash).length > 0) {
            var altoCabecera = jQuery('.cabecera').outerHeight();
            var margenSeguridad = 20; 
            var posicionDestino = jQuery(hash).offset().top - altoCabecera - margenSeguridad;

            jQuery('html, body').scrollTop(posicionDestino);
        }
    },

    clickbtnamarillo: function(e) {
        e.preventDefault();
        var src = jQuery(this).closest(".contenedor-cuadrado").find("img").attr("src");
        console.log(src);
    },

    obtenersrc: function() {
        var text = jQuery(this).find("h2").text();
        console.log(text);
    },

    precarga: function() {
        jQuery(".preloader").fadeOut("slow");
        jQuery(".logo-latido").fadeOut("slow", function() {
            jQuery("body").toggleClass("abierto");
        });

        acciones.redimensionar();
    },

    redimensionar: function() {
        ancho_pantalla = jQuery(window).width();

        if (ancho_pantalla < 768) {
            alto_menu = jQuery(".cabecera").innerHeight();
            jQuery(".cabecera .menu").css({"padding-top": alto_menu, "padding-bottom": alto_menu});  
        } else {
            jQuery(".cabecera .menu").css({"padding-top": 0, "padding-bottom": 0});  
        }
    },

    scrollventana: function() {
        // Sombra / Achicado de la cabecera al hacer scroll
        if (jQuery(window).width() > 768) {
            if (jQuery(this).scrollTop() > 50) {
                jQuery('.cabecera').addClass('scrolled');
            } else {
                jQuery('.cabecera').removeClass('scrolled');
            }
        } else {
            jQuery('.cabecera').removeClass('scrolled');
        }
    }
};

// Eventos de ciclo de vida del DOM
jQuery(document).ready(acciones.listo); 
jQuery(window).on("load", acciones.precarga);
jQuery(window).resize(acciones.redimensionar);
jQuery(window).scroll(acciones.scrollventana);

// Callback invocado directamente por reCAPTCHA
function validando(token) {
    if (jQuery("#formcontacto").valid()) {
        acciones.enviar(token);
    } else {
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(); 
        }
    }
}
