const manifest = {
    id: "org.cricket.live",
    version: "1.0.0",
    name: "Cricket Live Channels",
    description: "Watch live cricket channels including Sky Sports, Willow Cricket, Fox Cricket, and more.",
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
}

module.exports = manifest;