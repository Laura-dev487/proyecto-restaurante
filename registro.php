<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once('libs/PHPMailer/src/Exception.php');
require_once('libs/PHPMailer/src/PHPMailer.php');
//require 'path/to/PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);


require_once("config/database.php");
date_default_timezone_set("America/Argentina/Buenos_Aires");

$database = new Database();
$db = $database->getConnection();

// Si la clave no existe, asigna una cadena vacía en su lugar.
$recaptcha = $_POST["g-recaptcha-response"] ?? '';
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$email = isset($_POST['email']) ? $_POST['email'] : '';
$asunto = isset($_POST['asunto']) ? $_POST['asunto'] : '';
$mensaje = isset($_POST['mensaje']) ? $_POST['mensaje'] : '';
$fecha = date("Y-m-d H:i:s");


// NUEVA ETAPA DE SANEAMIENTO: Limpiar y codificar HTML
$nombre_saneado = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
$email_saneado = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$asunto_saneado = htmlspecialchars($asunto, ENT_QUOTES, 'UTF-8');
$mensaje_saneado = htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8');


// if(isset($nombre) and !empty($nombre))
// {
// 	if(isset($email) and !empty($email))
// 	{
// 		if(isset($asunto) and !empty($asunto))
// 		{
// 			if(isset($mensaje) and !empty($mensaje))
// 			{
// 				echo "Se registró satisfactoriamente";
// 			}else{
// 				echo "Ingrese mnesaje";
// 			}
// 		}else{
// 			echo "Ingrese asunto";
// 		}
// 	}else{
// 		echo "Ingrese email";
// 	}
// }else{
// 	echo "Ingrese nombre";
// }
$respuesta = array();
$listaerrores = array();

// if(isset($nombre) and !empty($nombre))
// {
// 	if(isset($email) and !empty($email))
// 	{
// 		if(isset($asunto) and !empty($asunto))
// 		{
// 			if(isset($mensaje) and !empty($mensaje))
// 			{
// 				$respuesta["tipo"] = 1;
// 				$respuesta["mensaje"] = "Se registró satisfactoriamente";
// 			}else{
// 				$respuesta["tipo"] = 2;
// 				$respuesta["mensaje"] = "Ingrese mnesaje";				
// 			}
// 		}else{
// 			$respuesta["tipo"] = 2;
// 			$respuesta["mensaje"] = "Ingrese asunto";				
// 		}
// 	}else{
// 		$respuesta["tipo"] = 2;
// 		$respuesta["mensaje"] = "Ingrese email";
// 	}
// }else{
// 	$respuesta["tipo"] = 2;
// 	$respuesta["mensaje"] = "Ingrese nombre";
// }

function is_ajax()
{
    if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) and strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        return true;
    }

    return false;
}

function validar_recaptcha($recaptcha)
{
	$url = 'https://www.google.com/recaptcha/api/siteverify';
	$data = array(
        'secret' => '6LcmZNQhAAAAAJXABrGW6H3XgLfrXbdKcltg3RQn',
        'response' => $recaptcha
    );

    $options = array(
        'http' => array(
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ),
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
        )
    );

    $context  = stream_context_create($options);
    $verify = file_get_contents($url, false, $context);

    return json_decode($verify, true);
}
// --- VALIDACIÓN DE NOMBRE (Requerido y Longitud Mínima) ---
if (empty($nombre_saneado)) {
    array_push($listaerrores, array(
        "id" => "nombre",
        "mensaje" => "Por favor, ingresa tu nombre."
    ));
} elseif (strlen($nombre_saneado) < 2) {
    array_push($listaerrores, array(
        "id" => "nombre",
        "mensaje" => "El nombre debe tener al menos 2 caracteres."
    ));
}

// --- VALIDACIÓN DE EMAIL (Requerido y Formato) ---
if (empty($email_saneado)) {
    array_push($listaerrores, array(
        "id" => "email",
        "mensaje" => "Por favor, ingresa un email."
    ));
} elseif (!filter_var($email_saneado, FILTER_VALIDATE_EMAIL)) {
    array_push($listaerrores, array(
        "id" => "email",
        "mensaje" => "El formato del email no es válido."
    ));
}

// --- VALIDACIÓN DE ASUNTO (Requerido y Longitud Mínima) ---
if (empty($asunto_saneado)) {
    array_push($listaerrores, array(
        "id" => "asunto",
        "mensaje" => "Por favor, ingresa un asunto."
    ));
} elseif (strlen($asunto_saneado) < 5) { // Asumo minlength 5
    array_push($listaerrores, array(
        "id" => "asunto",
        "mensaje" => "El asunto debe tener al menos 5 caracteres."
    ));
}

// --- VALIDACIÓN DE MENSAJE (Requerido y Longitud Mínima) ---
if (empty($mensaje_saneado)) {
    array_push($listaerrores, array(
        "id" => "mensaje",
        "mensaje" => "Por favor, ingresa un mensaje."
    ));
} elseif (strlen($mensaje_saneado) < 10) { // Asumo minlength 10
    array_push($listaerrores, array(
        "id" => "mensaje",
        "mensaje" => "El mensaje debe tener al menos 10 caracteres."
    ));
}


if(is_ajax())
{
    // --- 1. CORRECCIÓN DE LA CLAVE UNDEFINED (Línea ~18) ---
    // Usar la variable de forma segura, asignando cadena vacía si no existe.
    $recaptcha = $_POST["g-recaptcha-response"] ?? ''; 
    // --- FIN CORRECCIÓN ---


    // --- 2. LÓGICA DE DETECCIÓN DE ENTORNO ---
    // Detecta si el servidor es localhost o 127.0.0.1
    $is_local = ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_ADDR'] === '127.0.0.1');

    $captcha_success = FALSE; // Inicializa la variable de éxito del captcha

    if ($is_local) {
        // En entorno local (XAMPP), forzamos el éxito para permitir la prueba de BD.
        $captcha_success = TRUE;
    } else {
        // En servidor real (dominio en línea), ejecutamos la validación con Google.
        $respuestarecaptcha = validar_recaptcha($recaptcha);
        $captcha_success = $respuestarecaptcha["success"];
    }
    // --- FIN LÓGICA DE DETECCIÓN ---
    
    
    // --- 3. FLUJO PRINCIPAL DE CÓDIGO ---
    if($captcha_success == TRUE) // Se evalúa si es TRUE por la validación de Google o por ser localhost
    {
        if(count($listaerrores) > 0)
        {
            // Hay errores de validación de campos (nombre, email, etc.)
            $respuesta["tipo"] = 2;
            $respuesta["errores"] = $listaerrores;
       // NUEVO BLOQUE CON MANEJO DE EXCEPCIONES PDO
    } else {
        try {
            // 1. INSERCIÓN DE DATOS
            $query = "INSERT INTO tb_contacto(nombre,email,asunto,mensaje,fecha) 
                        VALUES(:nombre,:email,:asunto,:mensaje,:fecha)";
            $declaracion = $db->prepare($query);

            $declaracion->bindParam(":nombre",$nombre_saneado,PDO::PARAM_STR);
            $declaracion->bindParam(":email",$email_saneado,PDO::PARAM_STR);
            $declaracion->bindParam(":asunto",$asunto_saneado,PDO::PARAM_STR);
            $declaracion->bindParam(":mensaje",$mensaje_saneado,PDO::PARAM_STR);
            $declaracion->bindParam(":fecha",$fecha,PDO::PARAM_STR);

            $declaracion->execute(); // Si hay duplicado, lanza una PDOException aquí
            
            // Si la ejecución es exitosa:
            $agregado = "";
            
            // 2. ENVÍO DE CORREO ELECTRÓNICO (Tu lógica de PHPMailer)
            try {
                $body = "Nombre: ".$nombre_saneado."<br>";
                $body.= "Asunto: ".$asunto_saneado."<br>";
                $body.= "Email: ".$email_saneado."<br>";
                $body.= "Mensaje: ".$mensaje_saneado."<br>";
                $mail->Body = $body;

                // NOTA: Recuerda descomentar y configurar setFrom/addAddress para el servidor real.
                
                if($mail->send())
                {
                    $agregado = "Pronto nos comunicaremos contigo.";
                }
                
            } catch (Exception $e) {
                error_log("Mailer Error: {$mail->ErrorInfo}"); 
            }
            
            // 3. RESPUESTA FINAL DE ÉXITO
            $respuesta["tipo"] = 1;
            $respuesta["mensaje"] = "Se registró satisfactoriamente. ".$agregado;

        } catch (PDOException $e) {
            // CATCH: Capturamos la excepción lanzada por MySQL/PDO

            // Código 23000 = Duplicado (Integrity constraint violation)
            if ($e->getCode() == '23000') { 
                $respuesta["tipo"] = 4; // Usaremos '4' para error de duplicado
                $respuesta["mensaje"] = "Este correo electrónico ya fue registrado. Por favor, usa uno diferente.";
            } else {
                // Otro error de base de datos
                $respuesta["tipo"] = 3; 
                $respuesta["mensaje"] = "Error inesperado de base de datos.";
                error_log("Error DB: " . $e->getMessage()); // Para que tú lo veas en los logs
            }
        }
    } 
// FIN DEL NUEVO BLOQUE
    } else {
        // Fallo en la verificación de reCAPTCHA (Solo ocurre en un servidor real)
        $respuesta["tipo"] = 3;
        $respuesta["mensaje"] = "Eres un robot";
    }
} else {
    // Fallo en la verificación AJAX
    $respuesta["tipo"] = 3;
    $respuesta["mensaje"] = "Problema de servidor";
}

echo json_encode($respuesta);