import { readLines } from "https://deno.land/std/io/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

// const startTime = 0;
const checkTime = 1000;
// const checkWidth = 1000;
let startTime = 1639844441700;

var fieldArr = [];

for await (const dirEntry of Deno.readDir("./out")) {
  if (dirEntry.isFile) {
    let name = dirEntry.name;
    name = name.split(".");
    name.pop();
    fieldArr.push(name.join("."));
  }
}

console.log(fieldArr);

async function main(field) {
  let prevAmo = 0;
  let tmp = [];
  let prevValue = 0;
  let nowTime = startTime;
  let outFile = await Deno.open("./fout/" + field + ".csv", {
    write: true,
    create: true,
    append: true,
  });
  const filename = path.join(Deno.cwd(), "./out/" + field + ".csv");

  await Deno.writeAll(
    outFile,
    new TextEncoder().encode("time," + field + "\n"),
  );
  outFile.close();
  outFile = await Deno.open("./fout/" + field + ".csv", {
    write: true,
    create: true,
    append: true,
  });

  let fileReader = await Deno.open(filename);

  for await (let line of readLines(fileReader)) {
    // console.log("!");
    let timeStamp = line.split(",")[0];
    let value = +line.split(",")[1];
    // console.log(value);
    tmp.push(value);
    if (timeStamp > nowTime + checkTime) {
      let cv = (tmp.reduce((a, b) => a + b, 0) + prevValue) /
        (tmp.length + prevAmo);
      let print = nowTime - startTime + "," + cv + "\n";
      await Deno.writeAll(outFile, new TextEncoder().encode(print));
      outFile.close();
      outFile = await Deno.open("./fout/" + field + ".csv", {
        write: true,
        create: true,
        append: true,
      });

      tmp = [];
      nowTime += checkTime;
    }
  }
}

for await (const iterator of fieldArr) {
  await main(iterator);
}
