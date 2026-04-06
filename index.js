const axios = require('axios');
const fs = require('fs');

const sources = [
    { name: 'COLOMBIA', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'DEPORTES', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'CINE', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { name: 'DOCUMENTALES', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' }
];

// Aquí inyectamos los que SÍ funcionan fijo (los que te pasé antes)
const premiumManual = `
#EXTINF:-1 tvg-id="WinPlus" group-title="DEPORTES",Win+ Futbol HD
https://live20.bozztv.com/akamaissh101/ssh101/winsporplusco/playlist.m3u8
#EXTINF:-1 tvg-id="ESPN1" group-title="DEPORTES",ESPN 1 HD
http://158.69.124.135:8081/espn1/index.m3u8
#EXTINF:-1 tvg-id="HBO" group-title="CINE",HBO HD
http://158.69.124.135:8081/hbo/index.m3u8
`;

async function generateProfessionalPlaylist() {
    let finalPlaylist = "#EXTM3U\n" + premiumManual; 
    console.log("🚀 Extrayendo canales de la red...");

    for (const source of sources) {
        try {
            const response = await axios.get(source.url, { timeout: 5000 });
            let lines = response.data.split('\n');
            let count = 0;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("#EXTINF") && !lines[i].includes("[Geo-blocked]")) {
                    // Limpieza de etiquetas basura para que Smarters Pro no se confunda
                    let cleanLine = lines[i].replace(/group-title="[^"]*"/, `group-title="${source.name}"`);
                    
                    // Solo añadimos si tiene una URL válida en la siguiente línea
                    if (lines[i+1] && lines[i+1].startsWith('http')) {
                        finalPlaylist += cleanLine + "\n" + lines[i+1] + "\n";
                        count++;
                    }
                }
            }
            console.log(`✅ ${source.name}: ${count} añadidos.`);
        } catch (e) {
            console.error(`❌ Error en fuente ${source.name}: ${e.message}`);
        }
    }

    // Cambiamos el nombre para evitar el caché del TV
    fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
    console.log("\n🔥 Build completada. Ahora haz el push a GitHub.");
}

generateProfessionalPlaylist();