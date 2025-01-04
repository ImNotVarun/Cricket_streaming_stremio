const manifest = {
    id: "org.cricket.live",
    version: "1.0.0",
    name: "Cricket Live Channels",
    description: "Watch live cricket channels including Sky Sports, Willow Cricket, Fox Cricket, and more.",
    resources: ["stream", "catalog", "meta"],
    types: ["channel"],
    idPrefixes: ["cricket"],
    logo: "https://i.imgur.com/R0gkGPJ.png",
    catalogs: [
        {
            type: "channel",
            id: "cricket_catalog",
            name: "Live Cricket Channels",
            genres: ["Sports", "Cricket"]
        }
    ],
    background: "https://i.imgur.com/R0gkGPJ.png"
}

module.exports = manifest;