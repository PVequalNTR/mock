import { Model } from "../deps.ts";

function getSchemaLayer(this: any, Item: any, limitFields?: { secretData?: string[]; addOnData?: string[] }) {
  type fixType = {
    id: number;
  };

  type inherentType = typeof Item.defaults;
  interface itemData extends inherentType, fixType {}

  const secretData = limitFields?.secretData || []; //secret
  let requiredData: string[] = []; //all(public+secret)
  let publicData: string[] = []; //public
  const addOnData: string[] = limitFields?.addOnData || []; //addOn

  for (const key in Item.fields) {
    requiredData.push(key);
    if (!secretData.includes(key)) publicData.push(key);
  }

  requiredData = requiredData.concat(addOnData);
  publicData = publicData.concat(addOnData);

  class schemaLayer {
    public inited = false;
    public data?: itemData;
    public isList = false;
    private queryInfo: any = Item;

    constructor(data?: itemData) {
      if (data) {
        this.data = data;
        this.inited = true;
      }
    }

    public async all(): Promise<void> {
      this.data = await this.queryInfo.all();
      if (this.data) this.isList = true;
      else this.inited = false;
      return;
    }

    public async first(): Promise<void> {
      this.data = await this.queryInfo.first();
      if (this.data) this.inited = true;
      else this.inited = false;
      return;
    }

    public async delete(): Promise<void> {
      await this.queryInfo.delete();
      this.inited = false;
    }

    public async update(data: { [key: string]: string }): Promise<void> {
      await Item.where("id", this.data!.id.toString()).update(this.getCleanValue(data) as unknown as { [key: string]: string });
    }

    public async create(data: { [key: string]: string }): Promise<void> {
      await Item.create(this.getCleanValue(data) as any);
    }

    public where(fieldName: string | { [key: string]: string }, clauseOperator?: string, fieldValue?: string) {
      this.queryInfo = this.queryInfo.where(...arguments);
    }

    public orderBy(fieldName: string | { [key: string]: string }, asc?: string) {
      this.queryInfo = this.queryInfo.orderBy(...arguments);
      return;
    }

    public limit(limit: number) {
      this.queryInfo = this.queryInfo.limit(limit);
    }

    public getSanitzedValue(data: itemData = this.data!) {
      if (Array.isArray(data)) return data.map((item: itemData) => this.sanitize(item));
      return this.sanitize(this.data);
    }

    public async ref(schema: string): Promise<Model[]> {
      if (!this.inited) throw new Error("Cannot ref an uninitialized object");
      return (await Item.where("id", this.data!.id)?.[schema]()) as unknown as Model[];
    }

    private sanitize(data: itemData = this.data!): { [key: string]: string } {
      let input = data as unknown as { [key: string]: string };
      let output: { [key: string]: string } = {};
      for (const key in input) if (publicData.includes(key)) output[key] = input[key];
      return output;
    }

    private getCleanValue(data: { [key: string]: string }): itemData {
      let output = data;
      for (const key in output) if (!requiredData.includes(key)) delete output[key];
      if (output.id) delete output.id;
      return output as unknown as itemData;
    }
  }
  return schemaLayer;
}

export default getSchemaLayer;
