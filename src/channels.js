const channels = [
    {
        id: "cricket_sky_sports_nz",
        name: "Sky Sports NZ",
        logo: "https://example.com/sky_sports_nz.png",
        streamUrl: process.env.SKY_SPORTS_NZ,
    },
    {
        id: "cricket_willow_cricket",
        name: "Willow Cricket",
        logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.9yYMe9zcroNYsFfR2ItPiAAAAA%26pid%3DApi&f=1&ipt=8203d3a4e2c54e32d030e0c997f31d3704f2cc4387d088189cbcc625ee3bf975&ipo=images",
        streamUrl: process.env.WILLOW_CRICKET,
    },
    {
        id: "cricket_willow_extra",
        name: "Willow Extra",
        logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.9yYMe9zcroNYsFfR2ItPiAAAAA%26pid%3DApi&f=1&ipt=8203d3a4e2c54e32d030e0c997f31d3704f2cc4387d088189cbcc625ee3bf975&ipo=images",
        streamUrl: process.env.WILLOW_EXTRA,
    },
    {
        id: "cricket_fox_cricket",
        name: "Fox Cricket",
        logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.zyk-g7Jkl_FsroBxP3odlgHaHa%26pid%3DApi&f=1&ipt=1fa73550cec1aa23f5645e84f5a88f654d8a1602a8c0df0936f3db2ea41dd73d&ipo=images",
        streamUrl: process.env.FOX_CRICKET,
    },
    {
        id: "cricket_tnt_sports_3",
        name: "TNT Sports 3",
        logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.OWrOz54EXGRGR2gbkLl82gHaE8%26pid%3DApi&f=1&ipt=f14fd380391d068bdb22fffc28eaf696695de85a1cf879b0141b3fa933b68a5b&ipo=images",
        streamUrl: process.env.TNT_SPORTS_3,
    },
    {
        id: "cricket_sky_sports",
        name: "Sky Sports",
        logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.9qgE4aay1-CkVyu7MRVSrAHaEK%26pid%3DApi&f=1&ipt=05ab708f898f6aa33aba9d4e6312013d50517fef9ad3a2476ceb72052a49b4da&ipo=images",
        streamUrl: process.env.SKY_SPORTS,
    },
    {
        id: "cricket_sky_sports_main_event",
        name: "Sky Sports Main Event",
        logo: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.HfIBTDOTlAtPvKJvtJ9JsAHaHa%26pid%3DApi&f=1&ipt=abe6544cea67efcab03e055c561e4c8ebc1e82999bebd91aca12e8e38640f1d5&ipo=images",
        streamUrl: process.env.SKY_SPORTS_MAIN_EVENT,
    }
];

module.exports = { channels };