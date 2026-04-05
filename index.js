const axios = require('axios');
const fs = require('fs');

// Fuentes especializadas en DEPORTES y contenido Premium
const sources = [
  { name: 'Deportes Global', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
  { name: 'Cine y Series', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
  { name: 'TV Colombia Pro', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
  { name: 'TDT Premium', url: 'https://raw.githubusercontent.com/LaQuay/TDTChannels/master/lists/tv.m3u8' },
  // Fuente extra para eventos en vivo (repositorio alternativo)
  { name: 'Eventos Live', url: 'https://raw.githubusercontent.com/HelmerLuzo/IPTV_ES/main/IPTV_ES_DEPORTES.m3u' }
];

async function generatePlaylist() {
  let finalPlaylist = "#EXTM3U\n";
  console.log("⚽ Actualizando lista de DEPORTES y contenido...");

  for (const source of sources) {
    try {
      console.log(`Descargando: ${source.name}...`);
      const response = await axios.get(source.url);

      // Convertimos el contenido en líneas para procesarlo
      const lines = response.data.split('\n');

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF')) {
          // Forzamos que los de deportes tengan el grupo correcto para Smarters Pro
          if (source.name.includes('Deportes') || source.name.includes('Eventos')) {
            lines[i] = lines[i].replace(/group-title=".*?"/, 'group-title="DEPORTES PRO"');
          }
          finalPlaylist += lines[i] + "\n" + lines[i + 1] + "\n";
        }
      }
    } catch (error) {
      console.error(`❌ Error en ${source.name}: ${error.message}`);
    }
  }

  fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
  console.log("\n✅ ¡Lista maestra actualizada con éxito!");
}

generatePlaylist();
