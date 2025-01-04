const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const { channels } = require("../src/channels");

const manifest = {
    id: "org.cricket.live",
    version: "1.0.0",
    name: "Cricket Live Channels",
    description: "Watch live cricket with streams from various broadcasters.",
    resources: ["stream", "catalog", "meta"],
    types: ["channel"],
    idPrefixes: ["cricket"],
    logo: "https://c8.alamy.com/comp/2RADG2K/icc-international-cricket-council-trophy-logo-for-odi-cricket-world-cup-2023-in-india-template-brand-identity-logotype-man-cricket-world-cup-trop-2RADG2K.jpg",
    catalogs: [
        {
            type: "channel",
            id: "cricket_catalog",
            name: "Live Cricket Channels",
            genres: ["Sports", "Cricket"]
        }
    ],
    background: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.9Ut0kSOlIJ78mfa9oRyNFwHaE8%26pid%3DApi&f=1&ipt=310536ca2672f20aebb564262914d7d052a16375ce11600d2eb777a55a0691a0&ipo=images"
};

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