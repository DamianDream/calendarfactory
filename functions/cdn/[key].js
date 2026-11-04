export async function onRequestGet(context) {
  const { params, env } = context;
  const key = params.key;

  if (!key) {
    return new Response('Not Found', { status: 404 });
  }

  if (!env.BANNERS_BUCKET) {
    return new Response('R2 bucket BANNERS_BUCKET is not bound in Cloudflare Pages', { status: 503 });
  }

  try {
    const object = await env.BANNERS_BUCKET.get(key);
    if (!object) {
      return new Response('Image not found or expired', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=2592000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response('Failed to retrieve image: ' + (err.message || 'Internal error'), { status: 500 });
  }
}
