const axios = require('axios');
const fs = require('fs');

// Configuración de fuentes robustas para Deportes
const sources = {
    DEPORTES: [
        'https://raw.githubusercontent.com/fede-dm/peru-iptv/master/peru.m3u',
        'https://iptv-org.github.io/iptv/categories/sports.m3u',
        'https://raw.githubusercontent.com/Felipe-cyber/fuentes_apoyo/main/deportes_premium.m3u' // Fuente de respaldo
    ],
    COLOMBIA: 'https://iptv-org.github.io/iptv/countries/co.m3u',
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
    let contenidoFinal = "#EXTM3U\n";
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
                    if (lineas[i].startsWith('#EXTINF') && canalesEncontrados < 50) {
                        const info = lineas[i];
                        const link = lineas[i + 1];

                        if (link && link.startsWith('http')) {
                            // Validación extra para deportes
                            if (categoria === 'DEPORTES') {
                                const esValido = await validarCanal(link);
                                if (!esValido) continue;
                            }

                            contenidoFinal += `${info}\n${link}\n`;
                            canalesEncontrados++;
                        }
                    }
                }
            } catch (e) {
                console.log(`⚠️ Falló una fuente de ${categoria}, intentando la siguiente...`);
            }
        }
    }

    fs.writeFileSync('lista_nueva.m3u', contenidoFinal);
    console.log("✅ PROCESO COMPLETADO: Lista robusta generada.");
}

procesar(); 