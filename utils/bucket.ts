import { config } from "../deps.ts";
import { ensureDir } from "../deps.ts";

let basePath = "./" + config().STORAGE_PATH;

interface bucket {
  constructor(name: string): bucket;
  name: string;
}

class bucket {
  name: string;
  id: number;
  constructor(name: string, id?: number) {
    this.name = name;
    this.id = id || 0;
  }
  public async getPath(id: number = this.id): Promise<string> {
    let path = basePath + this.name;
    let sid = "" + id;
    for (let i = 0; i < sid.length; i += 2) path += "/" + sid.slice(i, i + 2);
    await ensureDir(path.replace(/(\/[.a-zA-Z0-9]*)$/, ""));
    return path;
  }
  public async getArrayBuffer(id: number = this.id): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
    const countWords = (s: string): number => s.split(/\s+/g).filter((w) => /[a-z0-9]/.test(w)).length;

    const decoder = new TextDecoder("utf-8");

    const file = await Deno.open("input.txt");
    const text = decoder.decode(await Deno.readAll(file));
    const count = countWords(text);
    console.log(`I read ${count} words.`);
  }
  public async getString(id: number = this.id): Promise<string> {
    console.warn(`getString hasn't been tested yet.`);
    return await Deno.readTextFile(await this.getPath(id));
  }
  public async writeString(s: string, id: number = this.id): Promise<void> {
    await Deno.writeTextFile(await this.getPath(id), s);
  }
}

export default bucket;
