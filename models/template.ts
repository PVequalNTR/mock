import { Model } from "../deps.ts";

type unsafeData = any;

/**
 * turn a model into a schema layer which can ensure the model's data is safe
 * when it is either being sent to the client or being store to the database
 * @param {Model} Item
 * @param limitFields
 * @returns
 */
function getSchemaLayer(this: any, Item: any, limitFields?: { secretData?: string[]; addOnData?: string[] }) {
  class itemData {
    id: number = 1;
  }

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
    public data?: itemData;
    public datas?: itemData[];
    public isList = false;
    private queryInfo: typeof Model = Item;

    constructor(data?: itemData) {
      if (data) this.data = data;
    }

    public where(paramlist: { [x: string]: string }): void;
    public where(fieldName: string, fieldValue: string | number): void;
    public where(fieldName: string, clauseOperator: string, fieldValue: string | number): void;
    public where(fieldName: any, clauseOperator?: any, fieldValue?: any): void {
      this.queryInfo = this.queryInfo.where.apply(this.queryInfo, arguments as any);
    }

    public async all(): Promise<void> {
      this.datas = (await this.queryInfo.all()) as unknown as itemData[];
      if (this.datas) this.isList = true;
      return;
    }

    public async first(): Promise<void> {
      this.data = (await this.queryInfo.first()) as unknown as itemData;
      return;
    }

    public async delete(): Promise<void> {
      await this.queryInfo.delete();
    }

    public async update(data: { [key: string]: string }): Promise<void> {
      let input = this.getCleanValue(data) as unknown as { [key: string]: string };
      // XXXid updates shoudld be perform on creat
      for (const key in input) if (/id$/gm.test(key)) delete input[key];
      await Item.where("id", this.id).update(input);
    }

    public async create(data: { [key: string]: string }): Promise<void> {
      await Item.create(this.getCleanValue(data));
    }

    public async orderBy(fieldName: string, asc: string): Promise<void>;
    public async orderBy(fieldName: { [key: string]: string }): Promise<void>;
    public async orderBy(fieldName: any, asc?: any): Promise<void> {
      this.queryInfo = this.queryInfo.orderBy.apply(this.queryInfo, arguments as any);
      return;
    }

    public limit(limit: number) {
      this.queryInfo = this.queryInfo.limit(limit);
    }

    public offset(offset: number) {
      this.queryInfo = this.queryInfo.offset(offset);
    }

    get id(): number {
      return this.data?.id || -1;
    }
    get ids(): number[] {
      if (Array.isArray(this.data)) return this.data!.map((x) => x.id);
      return [];
    }

    get found() {
      return !!this.data || !!this.datas;
    }

    // get sanitzed value form data which is safe to be sent to client
    public getSanitzedValue() {
      if (this.isList) return this.datas!.map((item: itemData) => this.sanitize(item));
      return this.sanitize(this.data);
    }

    // get ref value by pivot table or pirmary key
    public async ref(schema: string): Promise<Model[] | Model> {
      console.warn("ref is unsafe.(sanitizing problems)");
      if (schema[schema.length - 1] != "s") schema += "s";
      if (!this.found) throw new Error("Cannot ref an uninitialized object");
      return (await Item.where("id", this.id)?.[schema]()) as unknown as Model[];
    }

    // get sanitzed value from args which is safe to be sent to client
    private sanitize(data = this.data): { [key: string]: string } {
      let input = data as unknown as { [key: string]: string };
      let output: { [key: string]: string } = {};
      for (const key in input) if (publicData.includes(key)) output[key] = input[key];
      return output;
    }

    // get cleaned value which is safe to be stored to database
    private getCleanValue(data: { [key: string]: string | number | unsafeData }): itemData {
      let output = data;
      for (const key in output) if (!requiredData.includes(key)) delete output[key];
      // To prevent any possible injection
      for (const key in output) if (!(output[key] instanceof String)) output[key] = "" + output[key];
      if (output.id) delete output.id;
      return output as unknown as itemData;
    }
  }
  return schemaLayer;
}

export default getSchemaLayer;
