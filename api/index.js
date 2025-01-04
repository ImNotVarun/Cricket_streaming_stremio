const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const { channels } = require("../src/channels");
const NodeCache = require("node-cache");

const myCache = new NodeCache({ stdTTL: 600 });

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
    const handler = addonInterface[req.method.toLowerCase()];
    
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        if (handler) {
            const result = await handler(url);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(result));
        } else {
            res.status(404).send({ error: 'not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
};