exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // ── GET /catalog → returns in-stock products from Tienda Nube ──
  if (event.httpMethod === 'GET') {
    try {
      const TOKEN = process.env.TIENDANUBE_TOKEN;
      const STORE = process.env.TIENDANUBE_STORE_ID;
      if (!TOKEN || !STORE) throw new Error('Credenciales no configuradas');

      const tnHeaders = {
        'Authentication': `bearer ${TOKEN}`,
        'User-Agent': 'ODM Asesor (soporte@odmcosmeticos.com)',
        'Content-Type': 'application/json'
      };

      let allProducts = [];
      for (let page = 1; page <= 4; page++) {
        const res = await fetch(
          `https://api.tiendanube.com/v1/${STORE}/product?per_page=50&page=${page}`,
          { headers: tnHeaders }
        );
        if (!res.ok) break;
        const data = await res.json();
        if (!data.length) break;
        allProducts = allProducts.concat(data);
        if (data.length < 50) break;
      }

      const CATEGORIES = {
        bases: ['base','foundation','matte','skin tint','lumi','glow'],
        labiales: ['labial','labios','lip','gloss','tint','matte ink','lifter','brillo'],
        correctores: ['corrector','concealer','camo'],
        rubores: ['rubor','blush','cheek','cloudtopia'],
        bronzer: ['bronzer','bronceador','terra','contour'],
        iluminadores: ['iluminador','highlight','glow','luminoso','shimmer']
      };

      const catalog = [];
      for (const p of allProducts) {
        const name = (p.name?.es || p.name?.en || '').toLowerCase();
        const url = p.canonical_url || `https://www.odmcosmeticos.com/productos/${p.handle?.es || p.id}/`;

        let category = null;
        for (const [cat, keywords] of Object.entries(CATEGORIES)) {
          if (keywords.some(k => name.includes(k))) {
            category = cat;
            break;
          }
        }
        if (!category) continue;

        const variants = (p.variants || []).filter(v => v.stock === null || v.stock > 0);
        if (!variants.length) continue;

        catalog.push({
          id: p.id,
          brand: p.brand || '',
          name: p.name?.es || p.name?.en || '',
          category,
          url,
          variants: variants.map(v => ({
            name: [v.values?.[0]?.es, v.values?.[1]?.es].filter(Boolean).join(' - ') || 'Único',
            stock: v.stock,
            price: v.price
          }))
        });
      }

      return { statusCode: 200, headers, body: JSON.stringify(catalog) };

    } catch(err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── POST /analyze → calls OpenAI ──
  if (event.httpMethod === 'POST') {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: { message: 'API key no configurada' } }) };
    }
    try {
      const body = JSON.parse(event.body);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENAI_API_KEY
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch(err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: { message: err.message } }) };
    }
  }

  return { statusCode: 405, headers, body: 'Method Not Allowed' };
};
