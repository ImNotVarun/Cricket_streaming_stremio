const { addonBuilder } = require("stremio-addon-sdk");
require("dotenv").config();
const NodeCache = require("node-cache");
const { channels } = require("./channels");

const myCache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const manifest = {
    id: "org.cricket.live",
    version: "1.0.1",
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