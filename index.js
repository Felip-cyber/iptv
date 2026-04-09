const axios = require('axios');
const fs = require('fs');

const sources = [
    { name: 'COLOMBIA', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'LATINOAMERICA', url: 'https://raw.githubusercontent.com/fomostv/fomos-lists/main/fomos-latino.m3u' },
    { name: 'DEPORTES', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'DEPORTES_LATAM', url: 'https://raw.githubusercontent.com/Deportes-TV/Lists/main/deportes.m3u' },
    { name: 'CINE', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { name: 'SERIES', url: 'https://iptv-org.github.io/iptv/categories/series.m3u' },
    { name: 'DOCUMENTALES', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' },
    { name: 'INFANTIL', url: 'https://iptv-org.github.io/iptv/categories/kids.m3u' },
    { name: 'MUSICA', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
    { name: 'NOTICIAS', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
    { name: 'RELIGION', url: 'https://iptv-org.github.io/iptv/categories/religion.m3u' }
];

// Validador ultra rápido: Solo espera 1.2 segundos
async function checkLink(url) {
    try {
        await axios.get(url, { 
            timeout: 1200, 
            headers: { 'Range': 'bytes=0-100' } 
        });
        return true;
    } catch (e) {
        return false;
    }
}

async function generateProfessionalPlaylist() {
    let finalPlaylist = "#EXTM3U\n";
    console.log("⚡ Iniciando Agente Multi-hilo. Objetivo: Velocidad Máxima.");

    for (const source of sources) {
        try {
            console.log(`📡 Descargando fuente: ${source.name}...`);
            const response = await axios.get(source.url, { timeout: 15000 });
            let lines = response.data.split('\n');
            let validChannels = 0;
            const MAX_CHANNELS = 40; // Límite de canales por categoría para asegurar fluidez

            for (let i = 0; i < lines.length; i++) {
                if (validChannels >= MAX_CHANNELS) break;

                if (lines[i].includes("#EXTINF")) {
                    let url = lines[i+1]?.trim();
                    if (url && url.startsWith('http') && url.includes('.m3u8')) {
                        
                        // Verificación rápida
                        const alive = await checkLink(url);
                        if (alive) {
                            let cleanLine = lines[i].replace(/group-title="[^"]*"/, `group-title="${source.name}"`);
                            finalPlaylist += cleanLine + "\n" + url + "\n";
                            validChannels++;
                        }
                    }
                }
            }
            console.log(`✅ ${source.name}: ${validChannels} canales agregados.`);
        } catch (e) {
            console.error(`⚠️ Error en ${source.name}: Probablemente fuente caída.`);
        }
    }

    fs.writeFileSync('lista_nueva.m3u', finalPlaylist);
    console.log("\n🔥 ¡PROCESO COMPLETADO! Tu lista está lista para la TV.");
}

generateProfessionalPlaylist();