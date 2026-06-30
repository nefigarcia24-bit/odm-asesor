exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const STORE_ID = '3825101';
  const token = event.headers['x-token'];

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Token faltante' })
    };
  }

  // Path: e.g. /products, /orders?created_at_min=...
  const path = event.queryStringParameters?.path || '/products';
  const url = `https://api.tiendanube.com/v1/${STORE_ID}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authentication': `bearer ${token}`,
        'User-Agent': 'ODM-Dashboard/1.0 (soporte@odmcosmeticos.com)',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'X-Total-Count': response.headers.get('X-Total-Count') || ''
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
