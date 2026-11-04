export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!env.BANNERS_BUCKET) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'R2 bucket BANNERS_BUCKET is not bound in Cloudflare Pages. Please bind calendarfactory-banners in Settings -> Functions.',
      }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Expected multipart/form-data' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('banner') || formData.get('image');

    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'No image file uploaded' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: 'File size exceeds 2 MB limit' }),
        { status: 413, headers: corsHeaders }
      );
    }

    const ALLOWED_MIME = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    const mime = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME.includes(mime)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unsupported image format. Allowed: JPG, PNG, WebP, GIF, SVG',
        }),
        { status: 415, headers: corsHeaders }
      );
    }

    const extMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
    };
    const ext = extMap[mime] || '.png';
    const randomHex = Math.random().toString(36).substring(2, 10);
    const key = `banner-${Date.now()}-${randomHex}${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    await env.BANNERS_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: mime,
        cacheControl: 'public, max-age=2592000, immutable',
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: (file.name || 'banner').substring(0, 100),
        size: String(file.size),
        expiresDays: '30',
      },
    });

    const urlObj = new URL(request.url);
    const publicUrl = `${urlObj.origin}/cdn/${key}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        key: key,
        size: file.size,
        type: mime,
        expires_in_days: 30,
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Upload failed: ' + (err.message || 'Internal error'),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
