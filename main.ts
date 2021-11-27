import { Application, Router, RouterContext } from "./deps.ts";

import userR from "./routes/user.ts";
import initR from "./utils/init.ts";
import db from "./db/db.ts";

const app = new Application();
const router = new Router();
const port = +Deno.env.get("ENVIRONMENT")! || 3000;

if (Deno.env.get("ENVIRONMENT") == "development") {
  console.log("development mode!");
  app.use(initR.prefix("/dev").routes());
}

app.use(router.routes());
app.use(userR.prefix("/user").routes());
app.use(router.allowedMethods());

if (db.getConnector()._connected) {
  console.log("Database initing successfully");
}

console.log(`http://localhost:${port}`);

app.listen({ port });
