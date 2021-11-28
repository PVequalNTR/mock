import { Application, Router } from "./deps.ts";
import { green } from "./deps.ts";
import { config } from "./deps.ts";

import userR from "./routes/user.ts";
import initR from "./utils/init.ts";
import db from "./db/db.ts";
import logger from "./utils/logger.ts";

// load environment variables
config({ export: true });

const app = new Application();
const router = new Router();
const port = +Deno.env.get("ENVIRONMENT")! || 3000;

if (Deno.env.get("ENVIRONMENT") == "development") {
  console.log("initing development mode...");
  app.use(logger);
  app.use(initR.prefix("/dev").routes());
}

app.use(router.routes());
app.use(userR.prefix("/user").routes());
app.use(router.allowedMethods());

if (db.getConnector()._connected) {
  app.listen({ port });
  console.log(`app listening at ${green(`http://localhost:${port}`)}`);
}
