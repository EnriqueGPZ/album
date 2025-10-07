document.addEventListener('DOMContentLoaded', async function () {
    
    // --- CONFIGURACIÓN ---
    const IMAGEN_PORTADA = 'portada.jpg';
    const IMAGEN_CONTRAPORTADA = 'contraportada.jpg';
    const RUTA_IMAGENES = 'imagenes/';
    // --- FIN DE LA CONFIGURACIÓN ---

    const body = document.body;
    const bookContainer = document.getElementById('book-container');
    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const zoomBtn = document.getElementById('zoom-btn');
    const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V7h-2V5h5v5h-3z"/></svg>`;
    const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

    let hojas = [];
    let pliegoActual = 0;

    /**
     * Descubre automáticamente cuántos pliegos existen en la carpeta de imágenes.
     * Busca secuencialmente 'pliego1.jpg', 'pliego2.jpg', etc., hasta que uno falle.
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
                // Usamos 'HEAD' para solo verificar si el archivo existe, sin descargarlo.
                const response = await fetch(rutaCompleta, { method: 'HEAD' });
                if (response.ok) {
                    pliegosEncontrados.push(nombreArchivo);
                    i++;
                } else {
                    continuarBuscando = false; // El archivo no existe, paramos.
                }
            } catch (error) {
                continuarBuscando = false; // Error de red, paramos.
            }
        }
        
        console.log(`Álbum creado con ${pliegosEncontrados.length} pliegos.`);
        return pliegosEncontrados;
    }

    /**
     * Construye dinámicamente el álbum en el HTML.
     */
    async function crearAlbum() {
        book.innerHTML = '<p style="color: #999; font-weight: 300;">Cargando álbum...</p>';
        
        const IMAGENES_PLIEGOS = await descubrirPliegos();

        if (IMAGENES_PLIEGOS.length === 0) {
            book.innerHTML = '<p style="color: #999; font-weight: 300;">No se encontraron pliegos.<br>Asegúrate de que los archivos se llamen pliego1.jpg, pliego2.jpg, etc.</p>';
            bookContainer.classList.add('loaded'); // Muestra el mensaje de error
            return;
        }

        book.innerHTML = '';
        hojas = [];
        pliegoActual = 0;

        // Crear la hoja de la portada
        const hojaPortada = document.createElement('div');
        hojaPortada.classList.add('page');
        hojaPortada.innerHTML = `<div class="page-side front page-cover" style="background-image: url('${RUTA_IMAGENES}${IMAGEN_PORTADA}');"></div><div class="page-side back page-spread left-side" style="background-image: url('${RUTA_IMAGENES}${IMAGENES_PLIEGOS[0]}');"></div>`;
        hojas.push(hojaPortada);

        // Crear las hojas intermedias y la contraportada
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

        // Añadir las hojas al libro con su respectivo z-index para el efecto de profundidad
        for (let i = 0; i < hojas.length; i++) {
            const hoja = hojas[i];
            hoja.style.zIndex = hojas.length - i;
            hoja.style.setProperty('--z-offset', -i * 0.1);
            book.appendChild(hoja);
        }

        // Una vez todo está construido, hacemos visible el álbum para evitar el "salto" inicial.
        bookContainer.classList.add('loaded');
    }

    function pasarPliego() {
        if (pliegoActual >= hojas.length) return;
        hojas[pliegoActual].classList.add('flipped');
        pliegoActual++;
    }

    function retrocederPliego() {
        if (pliegoActual <= 0) return;
        pliegoActual--;
        hojas[pliegoActual].classList.remove('flipped');
    }
    
    function toggleZoom() {
        body.classList.toggle('album-zoomed');
        zoomBtn.innerHTML = body.classList.contains('album-zoomed') ? collapseIcon : expandIcon;
    }
    
    // --- INICIALIZACIÓN ---
    crearAlbum();
    nextBtn.addEventListener('click', pasarPliego);
    prevBtn.addEventListener('click', retrocederPliego);
    zoomBtn.addEventListener('click', toggleZoom);
});
