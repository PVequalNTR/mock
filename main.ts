import { Application, Router, RouterContext } from "./deps.ts";

import userR from "./routes/user.ts";
import db from "./db/db.ts";
// -dev
import User from "./models/User.ts";
import sha256 from "./utils/sha256.js";

const app = new Application();
const router = new Router();
const port = +Deno.env.get("ENVIRONMENT")! || 3000;

app.use(router.routes());
app.use(userR.prefix("/user").routes());
app.use(router.allowedMethods());

await db.sync();

console.log(`http://localhost:${port}`);

app.listen({ port });

// -dev
if (Deno.env.get("ENVIRONMENT") == "development") {
  console.log("development mode!");
  router.get("/test", (ctx) => {
    ctx.response.body =
      '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><h1>Hello World</h1></body></html>';
  });
  app.use(async (ctx, next: () => any) => {
    await next();
    await Deno.writeTextFile(
      "./in_connection.log",
      `${ctx.request.method} ${ctx.request.url}\n`,
      { append: true }
    );
  });
  // initialize test data at once
  if (!(await User.where("name", "admin").first())) {
    await User.create({
      name: "admin",
      hashedPassword: sha256("default"),
      privilege: 2,
    });
  } else console.log("admin user already exists");
}
