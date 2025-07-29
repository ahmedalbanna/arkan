import * as functions from 'firebase-functions';
import next from 'next';
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: '.next' } }); // Configure distDir
const handle = app.getRequestHandler();

export const nextjsApp = functions.https.onRequest(async (req, res) => {
  await app.prepare();
  handle(req, res);
});



setGlobalOptions({ maxInstances: 10 });
