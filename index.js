const { addonBuilder, getRouter } = require('stremio-addon-sdk');
const NodeCache = require('node-cache');
const { getChannels, getChannel } = require('./src/db');
const { CACHE_TTL, DEFAULT_PORT, STREAM_PREFIX } = require('./src/config');
require('dotenv').config();

// Cache initialization
const cache = new NodeCache({ stdTTL: CACHE_TTL });

const manifest = {
  id: 'org.cricketstreams',
  version: '1.0.0',
  name: 'Cricket Streams',
  description: 'Watch live cricket streams',
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
          poster: channel.logo_url
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

// Stream handler
builder.defineStreamHandler(async ({ type, id }) => {
  console.log('Stream requested:', type, id);
  
  if (type === 'tv' && id.startsWith(STREAM_PREFIX)) {
    const channelId = id.replace(STREAM_PREFIX, '');
    const cacheKey = `stream_${channelId}`;
    const cached = cache.get(cacheKey);

    if (cached) return cached;

    try {
      const channel = await getChannel(channelId);
      const response = {
        streams: [
          {
            title: channel.name,
            url: channel.stream_url,
            behaviorHints: {
              notWebReady: true
            }
          }
        ]
      };
      cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Stream error:', error);
      return { streams: [] };
    }
  }
  return { streams: [] };
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const { serveHTTP } = require('stremio-addon-sdk');
  serveHTTP(builder.getInterface(), { port: process.env.PORT || DEFAULT_PORT });
}

// For Vercel
module.exports = (req, res) => {
  const addonInterface = builder.getInterface();
  const router = getRouter(addonInterface);
  router(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
};