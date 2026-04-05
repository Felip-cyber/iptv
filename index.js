const axios = require('axios');
const fs = require('fs');

const sources = [
    { name: 'DEPORTES PREMIUM', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'COLOMBIA', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
    { name: 'INTERNACIONAL', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' }
];

function ensureGroupTitle(info, groupName) {
    if (/group-title="[^"]*"/.test(info)) {
        return info.replace(/group-title="[^"]*"/g, `group-title="${groupName}"`);
    }

    return info.replace('#EXTINF:-1', `#EXTINF:-1 group-title="${groupName}"`);
}

function isHighQuality(info) {
    return /(1080p|4k|uhd)/i.test(info);
}

async function generateProfessionalPlaylist() {
    let finalPlaylist = "#EXTM3U\n";
    const seenUrls = new Set();

    for (const source of sources) {
        try {
            const response = await axios.get(source.url);
            const lines = response.data.split('\n');

            for (let i = 0; i < lines.length; i++) {
                if (!lines[i].startsWith('#EXTINF')) {
                    continue;
                }

                // Limpiamos y profesionalizamos la etiqueta
                let info = lines[i];
                let j = i + 1;
                const optionLines = [];

                while (j < lines.length && lines[j].trim() !== '' && lines[j].startsWith('#')) {
                    if (!lines[j].startsWith('#EXTINF') && !lines[j].startsWith('#EXTM3U')) {
                        optionLines.push(lines[j]);
                    }
                    j += 1;
                }

                const url = lines[j] ? lines[j].trim() : '';

                // Filtro de calidad: Solo agregamos si tiene una URL valida y etiqueta HD/4K
                if (url && url.startsWith('http') && !seenUrls.has(url) && isHighQuality(info)) {
                    seenUrls.add(url);
                    // Forzamos el logo y el grupo profesional
                    info = ensureGroupTitle(info, source.name);

                    // Si el canal es de deportes, le inyectamos un logo genérico si no tiene
                    if (source.name === 'DEPORTES PREMIUM' && !info.includes('tvg-logo')) {
                        info = info.replace('#EXTINF:-1', '#EXTINF:-1 tvg-logo="https://cdn-icons-png.flaticon.com/512/857/857418.png"');
                    }

                    finalPlaylist += `${info}\n`;
                    if (optionLines.length > 0) {
                        finalPlaylist += `${optionLines.join('\n')}\n`;
                    }
                    finalPlaylist += `${url}\n`;
                }

                i = j;
            }
        } catch (e) {
            console.error(`Error en fuente ${source.name}`);
        }
    }

    fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
    console.log("🚀 Archivo profesional generado localmente.");
}

generateProfessionalPlaylist();