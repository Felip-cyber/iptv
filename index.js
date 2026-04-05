const axios = require('axios');
const fs = require('fs');

// 1. Definimos las fuentes (Repositorios RAW de GitHub)
const sources = [
  { name: 'Global', url: 'https://iptv-org.github.io/iptv/index.m3u' },
  { name: 'Cine', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
  { name: 'Deportes', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' }
];

async function generatePlaylist() {
  let finalPlaylist = "#EXTM3U\n";

  console.log("🚀 Iniciando la recopilación de canales...");

  for (const source of sources) {
    try {
      console.log(`fetching: ${source.name}...`);
      const response = await axios.get(source.url);

      // Limpiamos el contenido para quitar el encabezado #EXTM3U de cada sublista
      const cleanContent = response.data.replace("#EXTM3U\n", "");
      finalPlaylist += `\n# --- FUENTE: ${source.name} ---\n` + cleanContent;
    } catch (error) {
      console.error(`❌ Error en ${source.name}: ${error.message}`);
    }
  }

  // 2. Guardamos el archivo final
  fs.writeFileSync('lista_maestra.m3u', finalPlaylist);
  console.log("\n✅ ¡Éxito! Tu archivo 'lista_maestra.m3u' ha sido generado.");
}

generatePlaylist();
