document.addEventListener('DOMContentLoaded', async function () {
    
    // --- CONFIGURACIÓN ---
    // Ya no necesitamos la lista manual de pliegos.
    const IMAGEN_PORTADA = 'portada.jpg';
    const IMAGEN_CONTRAPORTADA = 'contraportada.jpg';
    const RUTA_IMAGENES = 'imagenes/';
    // --- FIN DE LA CONFIGURACIÓN ---

    const body = document.body;
    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const zoomBtn = document.getElementById('zoom-btn');
    const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V7h-2V5h5v5h-3z"/></svg>`;
    const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

    let hojas = [];
    let pliegoActual = 0;

    /**
     * NUEVA FUNCIÓN AUTOMÁTICA
     * Intenta cargar pliegos secuencialmente (pliego1.jpg, pliego2.jpg, etc.)
     * hasta que uno no se encuentre.
     * @returns {Promise<string[]>} Una lista con los nombres de archivo de los pliegos encontrados.
     */
    async function descubrirPliegos() {
        const pliegosEncontrados = [];
        let i = 1;
        let continuarBuscando = true;

        while (continuarBuscando) {
            const nombreArchivo = `pliego${i}.jpg`;
            const rutaCompleta = RUTA_IMAGENES + nombreArchivo;
            
            try {
                // Intentamos "pedir" la información de la imagen.
                // Si la respuesta no es 'ok' (ej. 404 Not Found), lanzará un error.
                const response = await fetch(rutaCompleta, { method: 'HEAD' });
                if (response.ok) {
                    pliegosEncontrados.push(nombreArchivo);
                    i++;
                } else {
                    continuarBuscando = false; // El archivo no existe, paramos.
                }
            } catch (error) {
                // Si hay un error de red o similar, también paramos.
                continuarBuscando = false;
            }
        }
        
        console.log(`Se encontraron ${pliegosEncontrados.length} pliegos.`);
        return pliegosEncontrados;
    }


    async function crearAlbum() {
        book.innerHTML = 'Cargando álbum...'; // Mensaje mientras se buscan los pliegos
        
        // 1. Descubrimos los pliegos automáticamente
        const IMAGENES_PLIEGOS = await descubrirPliegos();

        // Si no se encuentra ningún pliego, mostramos un mensaje y paramos.
        if (IMAGENES_PLIEGOS.length === 0) {
            book.innerHTML = '<p>No se encontraron pliegos. Asegúrate de que los archivos se llamen pliego1.jpg, pliego2.jpg, etc. y estén en la carpeta /imagenes.</p>';
            return;
        }

        // 2. Limpiamos el libro y reseteamos variables
        book.innerHTML = '';
        hojas = [];
        pliegoActual = 0;

        // 3. Creamos las hojas del libro (lógica casi idéntica a la anterior)
        const hojaPortada = document.createElement('div');
        hojaPortada.classList.add('page');
        hojaPortada.innerHTML = `<div class="page-side front page-cover" style="background-image: url('${RUTA_IMAGENES}${IMAGEN_PORTADA}');"></div><div class="page-side back page-spread left-side" style="background-image: url('${RUTA_IMAGENES}${IMAGENES_PLIEGOS[0]}');"></div>`;
        hojas.push(hojaPortada);

        for (let i = 0; i < IMAGENES_PLIEGOS.length; i++) {
            const hoja = document.createElement('div');
            hoja.classList.add('page');
            const anverso = `<div class="page-side front page-spread right-side" style="background-image: url('${RUTA_IMAGENES}${IMAGENES_PLIEGOS[i]}');"></div>`;
            let reverso;
            if (i < IMAGENES_PLIEGOS.length - 1) {
                reverso = `<div class="page-side back page-spread left-side" style="background-image: url('${RUTA_IMAGENES}${IMAGENES_PLIEGOS[i + 1]}');"></div>`;
            } else {
                reverso = `<div class="page-side back page-cover" style="background-image: url('${RUTA_IMAGENES}${IMAGEN_CONTRAPORTADA}');"></div>`;
            }
            hoja.innerHTML = anverso + reverso;
            hojas.push(hoja);
        }

        for (let i = 0; i < hojas.length; i++) {
            const hoja = hojas[i];
            hoja.style.zIndex = hojas.length - i;
            hoja.style.setProperty('--z-offset', -i * 0.1);
            book.appendChild(hoja);
        }
    }

    function pasarPliego() {
        if (pliegoActual >= hojas.length) return;
        const hojaQueGira = hojas[pliegoActual];
        hojaQueGira.classList.add('flipped');
        pliegoActual++;
    }

    function retrocederPliego() {
        if (pliegoActual <= 0) return;
        pliegoActual--;
        const hojaQueGira = hojas[pliegoActual];
        hojaQueGira.classList.remove('flipped');
    }
    
    function toggleZoom() {
        body.classList.toggle('album-zoomed');
        if (body.classList.contains('album-zoomed')) {
            zoomBtn.innerHTML = collapseIcon;
        } else {
            zoomBtn.innerHTML = expandIcon;
        }
    }
    
    // --- EVENT LISTENERS ---
    crearAlbum(); // Ahora esta función es asíncrona, pero se maneja correctamente.
    nextBtn.addEventListener('click', pasarPliego);
    prevBtn.addEventListener('click', retrocederPliego);
    zoomBtn.addEventListener('click', toggleZoom);
});