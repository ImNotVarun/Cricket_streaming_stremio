const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const { channels } = require("../src/channels");
const manifest = require("../src/manifest");

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id }) => {
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

    return { metas };
});

builder.defineMetaHandler(async ({ type, id }) => {
    const channel = channels.find(ch => ch.id === id);
    if (!channel) {
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

builder.defineStreamHandler(async ({ type, id }) => {
    const channel = channels.find(ch => ch.id === id);

    if (!channel || !channel.streamUrl) {
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

const addonInterface = builder.getInterface();

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // Handle root path and manifest
        if (pathname === '/' || pathname === '/manifest.json') {
            return res.status(200).json(manifest);
        }

        // Extract the resource type and handle the request
        const parts = pathname.slice(1).split('/');
        const resource = parts[0];

        if (!addonInterface[resource]) {
            console.error(`Resource not found: ${resource}`);
            return res.status(404).json({ error: 'Resource not found' });
        }

        const result = await addonInterface[resource](url.href);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ error: error.message });
    }
};
