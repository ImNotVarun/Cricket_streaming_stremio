const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const NodeCache = require("node-cache");

// Initialize cache with a longer TTL for debugging
const myCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes

// Basic logging utility
const log = (message, data = '') => {
    console.log(`[${new Date().toISOString()}] ${message}`, data);
};

// Error logging utility
const logError = (message, error) => {
    console.error(`[${new Date().toISOString()}] ${message}:`, error);
};

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

// Safe require for channels
let channels = [];
try {
    const channelsModule = require('./src/channels');
    channels = channelsModule.channels || [];
    log('Channels loaded successfully', `Count: ${channels.length}`);
} catch (error) {
    logError('Error loading channels module', error);
    channels = []; // Fallback to empty array
}

const builder = new addonBuilder(manifest);

// Wrap async handlers in try-catch
const safeHandler = async (handler) => {
    try {
        return await handler();
    } catch (error) {
        logError('Handler error', error);
        throw error;
    }
};

// Define the catalog handler
builder.defineCatalogHandler(async (args) => {
    return safeHandler(async () => {
        log('Catalog request received', args);
        
        if (args.type !== "channel" || args.id !== "cricket_catalog") {
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

        log('Returning catalog metas', `Count: ${metas.length}`);
        return { metas };
    });
});

// Define the meta handler
builder.defineMetaHandler(async (args) => {
    return safeHandler(async () => {
        log('Meta request received', args);
        
        const channel = channels.find(ch => ch.id === args.id);
        if (!channel) {
            log('Channel not found', args.id);
            return { meta: null };
        }

        return {
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
    });
});

// Define the stream handler
builder.defineStreamHandler(async (args) => {
    return safeHandler(async () => {
        log('Stream request received', args);
        
        const channel = channels.find(ch => ch.id === args.id);
        if (!channel || !channel.streamUrl) {
            log('Stream not found or no URL', args.id);
            return { streams: [] };
        }

        return {
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
    });
});

const addonInterface = builder.getInterface();

module.exports = async (req, res) => {
    try {
        // Initialize basic response headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        // Handle OPTIONS request
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Validate request URL
        if (!req.url) {
            throw new Error('Request URL is undefined');
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        log('Request received', pathname);

        // Handle root path - return manifest
        if (pathname === '/' || pathname === '/manifest.json') {
            log('Serving manifest');
            return res.status(200).json(manifest);
        }

        // Debug endpoint
        if (pathname === '/debug') {
            return res.status(200).json({
                env: {
                    NODE_ENV: process.env.NODE_ENV,
                    hasStreamUrls: Object.keys(process.env).filter(key => key.includes('_SPORTS') || key.includes('WILLOW')).length > 0
                },
                channels: channels.map(ch => ({
                    id: ch.id,
                    name: ch.name,
                    hasUrl: !!ch.streamUrl
                }))
            });
        }

        // Parse the resource from pathname
        const parts = pathname.slice(1).split('/');
        const resource = parts[0];

        if (!addonInterface[resource]) {
            log('Resource not found', resource);
            return res.status(404).json({ error: 'Resource not found' });
        }

        const result = await addonInterface[resource](url.href);
        log('Successfully processed request', resource);
        return res.status(200).json(result);

    } catch (error) {
        logError('Server error', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};