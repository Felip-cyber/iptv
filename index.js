const axios = require('axios');
const fs = require('fs');

const sources = [
    { name: 'Colombia', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: 'Deportes', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: 'Peliculas', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { name: 'Series', url: 'https://iptv-org.github.io/iptv/categories/series.m3u' }
];

async function generatePlaylist() {
    let finalPlaylist = "#EXTM3U\n";
    console.log("🚀 Filtrando los mejores canales para ti...");

    for (const source of sources) {
        try {
            const response = await axios.get(source.url);
            let content = response.data.replace("#EXTM3U\n", "");
            
            // EL TRUCO: Forzamos a la app a reconocer las categorías
            content = content.replaceAll('group-title="', `group-title="${source.name};`);
            
            finalPlaylist += `\n# --- ${source.name} ---\n` + content;
        } catch (e) {
            console.error(`Error en ${source.name}`);
        }
    }

    fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
    console.log("✅ Lista optimizada creada. ¡Haz el git push ahora!");
}
generatePlaylist();