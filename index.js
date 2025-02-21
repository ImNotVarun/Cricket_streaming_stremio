// index.js
const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const NodeCache = require('node-cache');
const { getChannels, getChannel } = require('./src/db');
const { CACHE_TTL, DEFAULT_PORT, STREAM_PREFIX } = require('./src/config');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: CACHE_TTL });

const manifest = {
  id: 'org.cricketstreams',
  version: '1.0.3',
  name: 'Cricket Streams',
  description: 'Watch live cricket streams with Acestream support',
  types: ['tv'],
  logo: "https://png.pngtree.com/png-vector/20230410/ourlarge/pngtree-icc-mens-cricket-world-cup-logo-vector-png-image_6698879.png",
  background: "https://data1.ibtimes.co.in/en/full/717924/rohit-sharma.jpg",
  catalogs: [
    {
      type: 'tv',
      id: 'cricket',
      name: 'Cricket Channels',
      extra: [{ name: 'search' }]
    }
  ],
  resources: ['stream', 'meta', 'catalog'],
  idPrefixes: [STREAM_PREFIX]
};

const builder = new addonBuilder(manifest);

// Catalog handler
builder.defineCatalogHandler(async ({ type, id }) => {
  console.log('Catalog requested:', type, id);

  if (type === 'tv' && id === 'cricket') {
    const cacheKey = 'cricket_channels';
    const cached = cache.get(cacheKey);

    if (cached) return cached;

    try {
      const channels = await getChannels();
      console.log("Fetched channels:", channels);

      const metas = channels.map(channel => ({
        id: `${STREAM_PREFIX}${channel.id}`,
        type: 'tv',
        name: channel.name,
        poster: channel.logo_url
      }));

      const response = { metas };
      cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Catalog error:', error);
      return { metas: [] };
    }
  }
  return { metas: [] };
});

// Meta handler
builder.defineMetaHandler(async ({ type, id }) => {
  console.log('Meta requested:', type, id);

  if (type === 'tv' && id.startsWith(STREAM_PREFIX)) {
    const channelId = id.replace(STREAM_PREFIX, '');
    const cacheKey = `meta_${channelId}`;
    const cached = cache.get(cacheKey);

    if (cached) return cached;

    try {
      const channel = await getChannel(channelId);
      const response = {
        meta: {
          id: id,
          type: 'tv',
          name: channel.name,
          poster: channel.logo_url,
          background: channel.logo_url
        }
      };
      cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Meta error:', error);
      return { meta: null };
    }
  }
  return { meta: null };
});

// Stream handler with Acestream support
builder.defineStreamHandler(async ({ type, id }) => {
  console.log('Stream requested:', type, id);

  if (type === 'tv' && id.startsWith(STREAM_PREFIX)) {
    const channelId = id.replace(STREAM_PREFIX, '');
    const cacheKey = `stream_${channelId}`;
    const cached = cache.get(cacheKey);

    if (cached) return cached;

    try {
      const channel = await getChannel(channelId);
      const streams = [];

      // 1. Acestream (if available)
      if (channel.acestream_id) {
        streams.push({
          title: `Acestream`,
          externalUrl: `acestream://${channel.acestream_id}`,
          behaviorHints: {
            notWebReady: true,
            external: true
          }
        });
      }

      // 2. m3u8 stream for in-app playback (if available)
      if (channel.m3u8_url) {
        streams.push({
          title: `Internal Player`,
          url: channel.m3u8_url,
          behaviorHints: {
            notWebReady: false
          }
        });
      }

      // 3. Main website stream (opens in browser)
      if (channel.stream_url) {
        streams.push({
          title: `Browser`,
          externalUrl: channel.stream_url,
          behaviorHints: {
            notWebReady: true,
            external: true
          }
        });
      }

      // 4. Additional streams (acestream, m3u8, or website)
      if (channel.additional_streams && channel.additional_streams.length > 0) {
        channel.additional_streams.forEach((stream, index) => {
          if (stream.acestream_id) {
            streams.push({
              title: `Stream ${index + 2} (Acestream)`,
              externalUrl: `acestream://${stream.acestream_id}`,
              behaviorHints: {
                notWebReady: true,
                external: true
              }
            });
          }
          if (stream.m3u8_url) {
            streams.push({
              title: `Stream ${index + 2} Internal Player`,
              url: stream.m3u8_url,
              behaviorHints: {
                notWebReady: false
              }
            });
          } else if (stream.url) {
            streams.push({
              title: `Stream ${index + 2} (Browser)`,
              externalUrl: stream.url,
              behaviorHints: {
                notWebReady: true,
                external: true
              }
            });
          }
        });
      }

      // 5. Website URL (if provided as a separate field)
      if (channel.website_url) {
        streams.push({
          title: `${channel.name} - Website`,
          externalUrl: channel.website_url,
          behaviorHints: {
            notWebReady: true,
            external: true
          }
        });
      }

      const response = { streams };
      cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Stream error:', error);
      return { streams: [] };
    }
  }
  return { streams: [] };
});

// For development: serve the addon over HTTP
if (process.env.NODE_ENV !== 'production') {
  const { serveHTTP } = require('stremio-addon-sdk');
  serveHTTP(builder.getInterface(), { port: process.env.PORT || DEFAULT_PORT });
}

module.exports = (req, res) => {
  const addonInterface = builder.getInterface();
  const router = getRouter(addonInterface);
  router(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
};