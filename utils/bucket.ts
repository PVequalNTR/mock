import { config } from "../deps.ts";
import { ensureDir, exists } from "../deps.ts";

let basePath = "./" + config().STORAGE_PATH.replace(/\/$/, "");
const bucketSize = 4 * 2; // 100**3

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
    let path = basePath + "/" + this.name;
    let sid = "" + id;
    sid = "0".repeat(bucketSize - sid.length) + sid;
    for (let i = 0; i < sid.length; i += 2) path += "/" + sid.slice(i, i + 2);
    await ensureDir(path.replace(/([.a-zA-Z0-9]*)$/, ""));
    return path;
  }
  public async getArrayBuffer(id: number = this.id): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
    const countWords = (s: string): number =>
      s.split(/\s+/g).filter((w) => /[a-z0-9]/.test(w)).length;

    const decoder = new TextDecoder("utf-8");

    const file = await Deno.open("input.txt");
    const text = decoder.decode(await Deno.readAll(file));
    const count = countWords(text);
    console.log(`I read ${count} words.`);
  }
  /**
   * get string form file
   * @param {number} id file id
   * @returns {string} file content in string
   */
  public async getString(id: number = this.id): Promise<string> {
    return await Deno.readTextFile(await this.getPath(id));
  }
  /**
   * write string to file
   * @param {number} id file id
   * @returns {void} void
   */
  public async writeString(s: string, id: number = this.id): Promise<void> {
    await Deno.writeTextFile(await this.getPath(id), s);
  }
  /**
   * delete file
   * @param {number} id file id
   * @returns {boolean} true if success
   */
  public async delete(id: number = this.id): Promise<boolean> {
    if (await exists(await this.getPath(id))) {
      await Deno.remove(await this.getPath(id));
      return true;
    }
    return false;
  }
}

export default bucket;
