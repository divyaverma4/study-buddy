/**
 * Firebase Cloud Functions entry point.
 * Currently no functions are defined.
 * Add functions below when needed.
 */

const { setGlobalOptions } = require("firebase-functions");

// Limit max instances (cost control)
setGlobalOptions({ maxInstances: 10 });

// Example function (commented out)
// const { onRequest } = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");
// exports.helloWorld = onRequest((req, res) => {
//   logger.info("Hello logs!", { structuredData: true });
//   res.send("Hello from Firebase!");
// });
