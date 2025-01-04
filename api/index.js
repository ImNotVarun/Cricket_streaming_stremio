const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const NodeCache = require("node-cache");
const { channels } = require("./src/channels");

const myCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const manifest = {
    id: "org.cricket.live",
    version: "1.0.0",
    name: "Cricket Live Channels",
    description: "Watch live cricket with streams from various broadcasters.",
    resources: ["stream", "catalog", "meta"],
    types: ["channel"],
    idPrefixes: ["cricket"],
    logo: "https://example.com/logo.png",
    catalogs: [
        {
            type: "channel",
            id: "cricket_catalog",
            name: "Live Cricket Channels",
            genres: ["Sports", "Cricket"]
        }
    ],
    background: "https://example.com/background.png"
};

const builder = new addonBuilder(manifest);

// Define the catalog handler
builder.defineCatalogHandler(async ({ type, id }) => {
    const cacheKey = `catalog_${type}_${id}`;
    const cachedResult = myCache.get(cacheKey);
    if (cachedResult) return cachedResult;

    if (type !== "channel" || id !== "cricket_catalog") {
        return { metas: [] };
    }

    const metas = channels.map((channel) => ({
        id: channel.id,
        type: "channel",
        name: channel.name,
        poster: channel.logo,
        posterShape: "square",
        background: channel.logo,
        logo: channel.logo,
        description: `Live cricket on ${channel.name}`,
        genres: ["Sports", "Cricket"]
    }));

    const result = { metas };
    myCache.set(cacheKey, result);
    return result;
});

// Define the meta handler
builder.defineMetaHandler(async ({ type, id }) => {
    const cacheKey = `meta_${type}_${id}`;
    const cachedResult = myCache.get(cacheKey);
    if (cachedResult) return cachedResult;

    const channel = channels.find(ch => ch.id === id);
    if (!channel) {
        return { meta: null };
    }

    const result = {
        meta: {
            id: channel.id,
            type: "channel",
            name: channel.name,
            poster: channel.logo,
            posterShape: "square",
            background: channel.logo,
            logo: channel.logo,
            description: `Live cricket on ${channel.name}`,
            genres: ["Sports", "Cricket"]
        }
    };

    myCache.set(cacheKey, result);
    return result;
});

// Define the stream handler
builder.defineStreamHandler(async ({ type, id }) => {
    const cacheKey = `stream_${type}_${id}`;
    const cachedResult = myCache.get(cacheKey);
    if (cachedResult) return cachedResult;

    const channel = channels.find(ch => ch.id === id);
    
    if (!channel || !channel.streamUrl) {
        return { streams: [] };
    }

    const result = {
        streams: [{
            title: channel.name,
            url: channel.streamUrl,
            name: "Live Stream",
            type: "channel",
            behaviorHints: {
                notWebReady: false
            }
        }]
    };

    myCache.set(cacheKey, result);
    return result;
});

const addonInterface = builder.getInterface();

module.exports = async (req, res) => {
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle root path - return manifest
    if (pathname === '/' || pathname === '/manifest.json') {
        return res.status(200).json(manifest);
    }

    try {
        // Remove leading slash and split path
        const parts = pathname.slice(1).split('/');
        const resource = parts[0];
        
        if (!addonInterface[resource]) {
            console.error(`Resource not found: ${resource}`);
            return res.status(404).json({ error: 'Resource not found' });
        }

        const result = await addonInterface[resource](req.url);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: error.message });
    }
};