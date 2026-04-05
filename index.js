const axios = require('axios');
const fs = require('fs');

// 1. CANALES VIP - Estos se inyectan manualmente para asegurar que estén de primero
const manualChannels = [
    { name: "WIN SPORTS +", logo: "https://i.imgur.com/vHqBvS8.png", url: "https://raw.githubusercontent.com/dfm-colombia/playlist/main/winsportsplus.m3u8" },
    { name: "WIN SPORTS", logo: "https://i.imgur.com/2Yn9wP1.png", url: "https://raw.githubusercontent.com/dfm-colombia/playlist/main/winsports.m3u8" },
    { name: "ESPN PREMIUM", logo: "https://i.imgur.com/pZ6XkXf.png", url: "https://raw.githubusercontent.com/dfm-colombia/playlist/main/espn_premium.m3u8" },
    { name: "ESPN 2", logo: "https://i.imgur.com/M6Lp5D9.png", url: "https://raw.githubusercontent.com/dfm-colombia/playlist/main/espn2.m3u8" },
    { name: "FOX SPORTS 1", logo: "https://i.imgur.com/7HnL6Lw.png", url: "https://raw.githubusercontent.com/dfm-colombia/playlist/main/foxsports1.m3u8" },
    { name: "DIRECTV SPORTS", logo: "https://i.imgur.com/pI6T6tN.png", url: "https://raw.githubusercontent.com/dfm-colombia/playlist/main/dsports.m3u8" }
];

// 2. FUENTES PARA SCRAPING AUTOMÁTICO
const sources = [
    { name: 'DEPORTES PREMIUM', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'COLOMBIA', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' }
];

// FUNCIONES DE UTILIDAD PROFESIONAL
function ensureGroupTitle(info, groupName) {
    if (/group-title="[^"]*"/.test(info)) {
        return info.replace(/group-title="[^"]*"/g, `group-title="${groupName}"`);
    }
    return info.replace('#EXTINF:-1', `#EXTINF:-1 group-title="${groupName}"`);
}

function isHighQuality(info) {
    // Solo dejamos pasar canales que digan explícitamente 1080, 4K o HD
    return /(1080p|4k|uhd|hd)/i.test(info);
}

async function generateProfessionalPlaylist() {
    let finalPlaylist = "#EXTM3U\n";
    const seenUrls = new Set();

    console.log("🛠️ Inyectando Canales VIP Deportivos...");
    
    // PRIMERO: Insertar los manuales (VIP)
    manualChannels.forEach(ch => {
        finalPlaylist += `#EXTINF:-1 tvg-logo="${ch.logo}" group-title="DEPORTES VIP",${ch.name}\n${ch.url}\n`;
        seenUrls.add(ch.url);
    });

    console.log("🔍 Escaneando y filtrando fuentes internacionales...");

    // SEGUNDO: Procesar fuentes automáticas con filtros de calidad
    for (const source of sources) {
        try {
            const response = await axios.get(source.url);
            const lines = response.data.split('\n');

            for (let i = 0; i < lines.length; i++) {
                if (!lines[i].startsWith('#EXTINF')) continue;

                let info = lines[i];
                let j = i + 1;
                const optionLines = [];

                // Capturar líneas de opciones (headers, user-agents, etc)
                while (j < lines.length && lines[j].trim() !== '' && lines[j].startsWith('#')) {
                    if (!lines[j].startsWith('#EXTINF') && !lines[j].startsWith('#EXTM3U')) {
                        optionLines.push(lines[j]);
                    }
                    j += 1;
                }

                const url = lines[j] ? lines[j].trim() : '';

                // FILTROS: URL válida + No duplicado + Calidad HD/4K
                if (url && url.startsWith('http') && !seenUrls.has(url) && isHighQuality(info)) {
                    seenUrls.add(url);
                    info = ensureGroupTitle(info, source.name);

                    // Logo genérico para deportes si falta
                    if (source.name === 'DEPORTES PREMIUM' && !info.includes('tvg-logo')) {
                        info = info.replace('#EXTINF:-1', '#EXTINF:-1 tvg-logo="https://cdn-icons-png.flaticon.com/512/857/857418.png"');
                    }

                    finalPlaylist += `${info}\n`;
                    if (optionLines.length > 0) finalPlaylist += `${optionLines.join('\n')}\n`;
                    finalPlaylist += `${url}\n`;
                }
                i = j;
            }
            console.log(`✅ ${source.name} procesado correctamente.`);
        } catch (e) {
            console.error(`❌ Error en fuente ${source.name}`);
        }
    }

    fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
    console.log("\n--------------------------------------------------");
    console.log("🚀 LISTA MAESTRA PROFESIONAL GENERADA");
    console.log(`📊 Canales totales: ${seenUrls.size}`);
    console.log("--------------------------------------------------");
}

generateProfessionalPlaylist();