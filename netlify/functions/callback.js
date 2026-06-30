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

    if (data.access_token) {
      // Redirige a la página con el token en el hash (no en URL para seguridad)
      return {
        statusCode: 302,
        headers: {
          Location: `https://nefigarcia24-bit.github.io/odm-asesor/obtener-token.html#token=${data.access_token}`
        },
        body: ''
      };
    } else {
      return {
        statusCode: 302,
        headers: {
          Location: `https://nefigarcia24-bit.github.io/odm-asesor/obtener-token.html#error=${encodeURIComponent(JSON.stringify(data))}`
        },
        body: ''
      };
    }
  } catch (err) {
    return {
      statusCode: 302,
      headers: {
        Location: `https://nefigarcia24-bit.github.io/odm-asesor/obtener-token.html#error=${encodeURIComponent(err.message)}`
      },
      body: ''
    };
  }
};
