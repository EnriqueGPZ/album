<?php
// Establece la cabecera para indicar que la respuesta es un JSON
header('Content-Type: application/json');

// Define la ruta a la carpeta de imágenes (sube un nivel desde /api/ a la raíz)
$directorioImagenes = '../imagenes/';

// Escanea el directorio
$archivos = scandir($directorioImagenes);

$pliegos = [];

if ($archivos) {
    // Itera sobre cada archivo encontrado
    foreach ($archivos as $archivo) {
        // Usamos una expresión regular para encontrar archivos que empiecen por "pliego",
        // seguido de números, y terminen en .jpg (insensible a mayúsculas/minúsculas)
        if (preg_match('/^pliego\d+\.jpg$/i', $archivo)) {
            $pliegos[] = $archivo;
        }
    }
    
    // Ordena los archivos de forma natural para que pliego10.jpg vaya después de pliego9.jpg
    natsort($pliegos);
}

// Convierte el array de pliegos a formato JSON y lo envía como respuesta.
// usamos array_values para re-indexar el array numéricamente.
echo json_encode(array_values($pliegos));
?>