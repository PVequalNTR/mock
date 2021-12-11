import User from "../db/models/User.ts";

let requiredData: string[] = [];
for (const key in User.fields) if (Object.prototype.hasOwnProperty.call(User.fields, key)) requiredData.push(key);

type fixType = {
  id: number;
};
type inherentType = typeof User.defaults;
interface userData extends inherentType, fixType {}

const secretData = ["hashedPassword", "privilege"];

class objUser {
  private inited = false;
  public data?: userData;
  constructor(data?: userData) {
    if (data) {
      this.data = data;
      this.inited = true;
    }
  }
  public async where(fieldName: string, fieldValue: string): Promise<void> {
    if (!this.inited) {
      this.data = (await User.where(fieldName, fieldValue).first()) as any;
      this.inited = true;
    } else throw Error("User has already been initialized");
  }
  public async find(id: number): Promise<void> {
    if (!this.inited) {
      this.data = (await User.find(id)) as any;
      this.inited = true;
    } else throw Error("User has already been initialized");
  }
  public sanitize(): objUser {
    if (!this.inited) throw Error("User hasn't been initialized");
    let output = this.data;
    for (const key in output) if (secretData.includes(key)) delete (output as any)[key];
    return output as unknown as objUser;
  }
  public async update(data: { [K in keyof string]?: string }): Promise<void> {
    if (!this.inited) throw Error("User hasn't been initialized");
    await User.update(this.data!.id.toString(), data as any);
  }
}

export default objUser;
