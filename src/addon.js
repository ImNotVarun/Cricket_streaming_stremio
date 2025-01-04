const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const NodeCache = require("node-cache");
const { channels } = require("./channels");

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

module.exports = builder.getInterface();