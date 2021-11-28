// import { Middleware } from "../deps.ts";
import { green, bgRed, black, bgBrightWhite } from "../deps.ts";

function format(
  x: String | number,
  d: number,
  align: "left" | "mid" | "right" = "right"
) {
  let spacing = " ";
  if (typeof x === "number") spacing = "0";
  const reSpacing = d - x.toString().length;
  if (align == "left") return x + spacing.repeat(reSpacing);
  else if (align == "right") return spacing.repeat(reSpacing) + x;
  else
    return (
      spacing.repeat(reSpacing / 2) +
      x +
      spacing.repeat(Math.ceil(reSpacing / 2))
    );
}

export default async function logger(ctx: any, next: () => any): Promise<any> {
  let text = "";
  const start = Date.now();
  text +=
    format(ctx.request.method, 6, "mid") +
    " " +
    bgBrightWhite(black(format(new URL(ctx.request.url).pathname, 25, "left")));
  await next();
  if (ctx.response.status.toString()[0] == "2")
    text += " " + green(`${ctx.response.status}`);
  else text += " " + bgRed(black(`${ctx.response.status}`));
  text += ` ${format(Date.now() - start, 3)}ms`;
  console.log(text);
}
