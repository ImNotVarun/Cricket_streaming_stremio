const { serveHTTP, publishToCentral } = require("stremio-addon-sdk");
const addonInterface = require("./src/addon");

serveHTTP(addonInterface, { port: process.env.PORT || 3000 });