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
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle root path - return manifest
    if (pathname === '/' || pathname === '/manifest.json') {
        return res.status(200).send(JSON.stringify(manifest));
    }

    try {
        // Remove leading slash and split path
        const parts = pathname.slice(1).split('/');
        const resource = parts[0];
        
        if (!addonInterface[resource]) {
            return res.status(404).send({ error: 'Resource not found' });
        }

        const result = await addonInterface[resource](req.url);
        return res.status(200).send(JSON.stringify(result));
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
};
