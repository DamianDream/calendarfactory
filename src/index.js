export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("CalendarFactory is running", {
      headers: { "content-type": "text/plain;charset=UTF-8" }
    });
  }
};
