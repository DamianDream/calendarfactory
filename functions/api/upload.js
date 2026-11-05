// Cloudflare Pages Function: /api/upload
// Securely proxies banner uploads to ImgBB without exposing the API key to the client.

async function handleUpload(request, env) {
  try {
    const apiKey = env && env.IMGBB_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'IMGBB_API_KEY is not configured in Cloudflare Settings -> Variables and secrets'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // IP Rate limiting (10 seconds cooldown per client IP)
    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
    const cache = (typeof caches !== 'undefined' && caches.default) ? caches.default : null;
    const rateLimitUrl = `https://rate-limit.internal/${encodeURIComponent(clientIp)}`;
    if (cache) {
      const existing = await cache.match(rateLimitUrl);
      if (existing) {
        return new Response(JSON.stringify({
          error: 'Please wait 10 seconds before uploading another banner'
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': '10',
          },
        });
      }
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image') || formData.get('fileToUpload');
    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No image file uploaded' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 2 MB limit (2,097,152 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'File size exceeds 2 MB limit' }), {
        status: 413,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return new Response(JSON.stringify({
        error: 'Unsupported image type. Allowed: JPG, PNG, WebP, GIF, SVG'
      }), {
        status: 415,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Forward to ImgBB API
    const imgbbForm = new FormData();
    imgbbForm.append('image', file, file.name || 'banner.png');
    if (env.IMGBB_EXPIRATION) {
      imgbbForm.append('expiration', env.IMGBB_EXPIRATION);
    }

    let imgbbUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;
    const imgbbRes = await fetch(imgbbUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'X-Forwarded-For': clientIp,
        'CF-Connecting-IP': clientIp,
      },
      body: imgbbForm,
    });

    const data = await imgbbRes.json().catch(() => null);

    if (!imgbbRes.ok || !data || !data.success) {
      const errMsg = (data && data.error && data.error.message)
        ? data.error.message
        : 'ImgBB upload failed';
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Record rate limit in cache for 10 seconds
    if (cache) {
      const rlResp = new Response('1', {
        headers: {
          'Cache-Control': 'max-age=10',
          'Content-Type': 'text/plain',
        },
      });
      await cache.put(rateLimitUrl, rlResp);
    }

    const directUrl = (data.data && (data.data.url || data.data.display_url)) || '';
    return new Response(JSON.stringify({
      success: true,
      url: directUrl,
      id: data.data ? data.data.id : null,
      title: data.data ? data.data.title : '',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestGet(context) {
  const apiKey = context.env && context.env.IMGBB_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'IMGBB_API_KEY is not configured in Cloudflare Settings -> Variables and secrets'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  return new Response(JSON.stringify({
    key: apiKey
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequestPost(context) {
  return handleUpload(context.request, context.env);
}
