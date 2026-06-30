exports.handler = async function(event) {
  const { code } = event.queryStringParameters || {};

  if (!event.queryStringParameters) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No se recibieron parámetros' })
    };
  }

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Código de autorización faltante' })
    };
  }

  const CLIENT_ID = '32688';
  const CLIENT_SECRET = '5ff7c84279d33c5ff2817a6a072e8f461081f8b52eac1e1d';

  try {
    const response = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code
      })
    });

    const data = await response.json();

    // MODO DIAGNÓSTICO: muestra el JSON completo en pantalla, sin redirigir
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        http_status: response.status,
        full_response: data
      }, null, 2)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
