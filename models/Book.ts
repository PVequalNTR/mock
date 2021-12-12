import Book from "../db/schemas/Book.ts";

let requiredData: string[] = [];
for (const key in Book.fields) if (Object.prototype.hasOwnProperty.call(Book.fields, key)) requiredData.push(key);

type fixType = {
  id: number;
};
type inherentType = typeof Book.defaults;
interface bookData extends inherentType, fixType {}

const secretData = ["privilege", "path"];

class objBook {
  private inited = false;
  public data?: bookData;
  constructor(data?: bookData) {
    if (data) {
      this.data = data;
      this.inited = true;
    }
  }
  public async where(fieldName: string, fieldValue: string): Promise<void> {
    if (!this.inited) {
      this.data = (await Book.where(fieldName, fieldValue).first()) as any;
      this.inited = true;
    } else throw Error("Book has already been initialized");
  }
  public async find(id: number): Promise<void> {
    if (!this.inited) {
      this.data = (await Book.find(id)) as any;
      this.inited = true;
    } else throw Error("Book has already been initialized");
  }
  public sanitize(): objBook {
    if (!this.inited) throw Error("Book hasn't been initialized");
    let output = this.data;
    for (const key in output) if (secretData.includes(key)) delete (output as any)[key];
    return output as unknown as objBook;
  }
  public async update(data: { [K in keyof string]?: string }): Promise<void> {
    if (!this.inited) throw Error("Book hasn't been initialized");
    await Book.update(this.data!.id.toString(), data as any);
  }
}

export default objBook;
