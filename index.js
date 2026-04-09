const axios = require('axios');
const fs = require('fs');

// Configuración de fuentes robustas para Deportes
const sources = {
    DEPORTES: [
        'https://raw.githubusercontent.com/carlosep94/IPTV-COLOMBIA/main/Deportes.m3u', // Fuente específica de CO
        'https://raw.githubusercontent.com/AndresSoria/IPTV-Colombia/master/Colombia.m3u',
        'https://iptv-org.github.io/iptv/categories/sports.m3u'
    ],
    COLOMBIA: [
        'https://iptv-org.github.io/iptv/countries/co.m3u',
        'https://raw.githubusercontent.com/AndresSoria/IPTV-Colombia/master/Colombia.m3u'
    ],
    CINE: 'https://iptv-org.github.io/iptv/categories/movies.m3u'
};

async function validarCanal(url) {
    try {
        // Disfrazamos al robot como un navegador real para evitar bloqueos
        const response = await axios.head(url, { 
            timeout: 3000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

async function procesar() {
    let contenidoFinal = "";
    let canalesPremiumText = "";
    console.log("🚀 Iniciando Agente Robusto V2...");

    for (const [categoria, urls] of Object.entries(sources)) {
        console.log(`📡 Procesando ${categoria}...`);
        
        // Si es un array (como Deportes), intentamos todas las fuentes hasta tener éxito
        const urlList = Array.isArray(urls) ? urls : [urls];
        let canalesEncontrados = 0;

        for (const url of urlList) {
            try {
                const res = await axios.get(url, { timeout: 5000 });
                const lineas = res.data.split('\n');

                for (let i = 0; i < lineas.length; i++) {
                    // Para subir la calidad, podemos darle prioridad a las palabras 'HD', '1080' o 'FHD'
                    if (lineas[i].startsWith('#EXTINF') && canalesEncontrados < 50) {
                        const info = lineas[i];
                        const link = lineas[i + 1];

                        if (link && link.startsWith('http')) {
                            // Validación extra para deportes
                            if (categoria === 'DEPORTES') {
                                const esValido = await validarCanal(link);
                                if (!esValido) continue;
                            }

                            const nombreCanal = info.toLowerCase();
                            
                            // 1. Añadimos lógica de palabras CLAVE Premium para que no se nos escapen
                            if (nombreCanal.includes('win sports') || nombreCanal.includes('espn') || nombreCanal.includes('fox sports')) {
                                canalesPremiumText += `${info}\n${link}\n`;
                                canalesEncontrados++;
                            } 
                            // 2. Filtro de Alta Calidad (HD / 1080p)
                            else if (nombreCanal.includes('hd') || nombreCanal.includes('1080') || nombreCanal.includes('fhd')) {
                                contenidoFinal += `${info}\n${link}\n`;
                                canalesEncontrados++;
                            }
                            // 3. Fallback si no hay calidad específica pero no ha llegado al límite
                            else {
                                contenidoFinal += `${info}\n${link}\n`;
                                canalesEncontrados++;
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(`⚠️ Falló una fuente de ${categoria}, intentando la siguiente...`);
            }
        }
    }

    // Juntamos la cabecera original, los Premium primero, y luego el resto de alta calidad HD
    const listaCompleta = "#EXTM3U\n" + canalesPremiumText + contenidoFinal;
    fs.writeFileSync('lista_nueva.m3u', listaCompleta);
    console.log("✅ PROCESO COMPLETADO: Lista robusta generada.");
}

procesar(); 