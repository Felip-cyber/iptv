const axios = require('axios');
const fs = require('fs');

const sources = [
    { name: 'Colombia', category: 'Live', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'Deportes', category: 'Live', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'Peliculas', category: 'Movies', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { name: 'Series', category: 'Series', url: 'https://iptv-org.github.io/iptv/categories/series.m3u' }
];

async function generateProfessionalPlaylist() {
    let finalPlaylist = "#EXTM3U\n";
    console.log("🚀 Filtrando contenido estable por categorías...");

    for (const source of sources) {
        try {
            const response = await axios.get(source.url);
            let lines = response.data.split('\n');
            let count = 0;
            
            for (let i = 0; i < lines.length; i++) {
                // Filtramos canales bloqueados y basura
                if (lines[i].includes("#EXTINF") && !lines[i].includes("[Geo-blocked]")) {
                    // El truco: Inyectamos la categoría para que la TV sepa qué es
                    let infoLine = lines[i].replace('group-title="', `group-title="${source.name};`);
                    
                    // Si es película o serie, Smarters Pro necesita esto para clasificarlo:
                    if (source.category !== 'Live') {
                        infoLine = infoLine.replace('#EXTINF:-1', `#EXTINF:-1 group-title="${source.category}"`);
                    }

                    finalPlaylist += infoLine + "\n" + lines[i+1] + "\n";
                    count++;
                }
            }
            console.log(`✅ ${source.name}: ${count} elementos añadidos.`);
        } catch (e) {
            console.error(`❌ Error en fuente ${source.name}`);
        }
    }

    fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
    console.log("\n🔥 ¡Lista Maestra terminada! Ahora haz: git add . && git commit -m 'Categorias OK' && git push");
}

generateProfessionalPlaylist();