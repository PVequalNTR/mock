import { readLines } from "https://deno.land/std/io/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const filename = path.join(Deno.cwd(), "./out.json.txt");
let fileReader = await Deno.open(filename);

for await (let line of readLines(fileReader)) {
  //   console.log(line);
  let data = JSON.parse(line);
  if (data.type == "Point") {
    const file = await Deno.open("./out/" + data.metric + ".csv", {
      write: true,
      create: true,
      append: true,
    });
    /* ... */
    await Deno.writeAll(
      file,
      new TextEncoder().encode(
        "" + +new Date(data.data.time) + "," + data.data.value + "\n",
      ),
    );
    file.close(); // You need to close it!
  }
}
