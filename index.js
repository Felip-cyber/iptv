const axios = require('axios');
const fs = require('fs');

const sources = [
    { name: 'COLOMBIA', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'DEPORTES', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'CINE', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { name: 'DOCUMENTALES', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u' }
];

// FUNCIÓN AGENTE: Verifica si el canal está activo antes de agregarlo
async function checkLink(url) {
    try {
        const res = await axios.get(url, { timeout: 3000, headers: { 'Range': 'bytes=0-100' } });
        return res.status === 200;
    } catch (e) {
        return false;
    }
}

async function generateProfessionalPlaylist() {
    let finalPlaylist = "#EXTM3U\n";
    console.log("🤖 Agente de IPTV activado. Validando enlaces...");

    for (const source of sources) {
        try {
            const response = await axios.get(source.url, { timeout: 10000 });
            let lines = response.data.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("#EXTINF")) {
                    let url = lines[i+1]?.trim();
                    if (url && url.startsWith('http')) {
                        
                        // Aquí el agente toma la decisión
                        const isAlive = await checkLink(url); 
                        if (isAlive) {
                            let cleanLine = lines[i].replace(/group-title="[^"]*"/, `group-title="${source.name}"`);
                            finalPlaylist += cleanLine + "\n" + url + "\n";
                        }
                    }
                }
            }
            console.log(`✅ Fuente ${source.name} procesada.`);
        } catch (e) {
            console.error(`❌ Error en ${source.name}`);
        }
    }

    fs.writeFileSync('lista_nueva.m3u', finalPlaylist);
    console.log("\n🔥 Build limpia. Solo canales activos guardados.");
}

generateProfessionalPlaylist();