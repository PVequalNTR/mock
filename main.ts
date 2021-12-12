import { Application, Router } from "./deps.ts";
import { green } from "./deps.ts";
import { config } from "./deps.ts";

import userRouter from "./routes/user.ts";
import postRouter from "./routes/post.ts";
import tokenRouter from "./routes/token.ts";
import bookRouter from "./routes/book.ts";
import defaultRouter from "./routes/default.ts";

import db from "./db/db.ts";

// for development
import initR from "./utils/init.ts";
import logger from "./utils/logger.ts";

const app = new Application();
const router = new Router();
const port = +config().PORT || 3000;

if (config().ENVIRONMENT == "development") app.use(logger);
app.use(initR.prefix("/api/dev").routes());

app.use(router.routes());
app.use(userRouter.prefix("/api/user").routes());
app.use(postRouter.prefix("/api/post").routes());
app.use(bookRouter.prefix("/api/book").routes());
app.use(tokenRouter.prefix("/api/token").routes());
app.use(defaultRouter);
app.use(router.allowedMethods());

if (db.getConnector()._connected) {
  app.listen({ port });
  console.log(`app listening at ${green("http://localhost:" + port)}`);
}
