import { Model } from "../deps.ts";

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

  interface sqlInstruction {
    where(paramlist: { [key in string]: string }): void;
    where(fieldName: string, fieldValue: string | number): void;
    where(fieldName: string, clauseOperator: string, fieldValue: string | number): void;
  }
  class schemaLayer implements sqlInstruction {
    public inited = false;
    public data?: itemData;
    public datas?: itemData[];
    public isList = false;
    private queryInfo: typeof Model = Item;

    constructor(data?: itemData) {
      if (data) {
        this.data = data;
        this.inited = true;
      }
    }

    /**
     * where clause in sql
     *
     * @param {{ [x: string]: string }} paramlist Start of interval
     */ /**
     * sugar version impl for where clause in sql
     *
     * @param {string} fieldName Array containing start and end dates.
     * @param {string | number} fieldValue
     */ /**
     * where clause in sql with operator(>,<,=,etc)
     *
     * @param {string} fieldName Array containing start and end dates.
     * @param {string} clauseOperator
     * @param {string | number} fieldValue
     */
    public where(paramlist: { [x: string]: string }): void;
    public where(fieldName: string, fieldValue: string | number): void;
    public where(fieldName: string, clauseOperator: string, fieldValue: string | number): void;
    public where(fieldName: any, clauseOperator?: any, fieldValue?: any): void {
      this.queryInfo = this.queryInfo.where.apply(this.queryInfo, arguments as any);
    }

    public async all(): Promise<void> {
      this.datas = (await this.queryInfo.all()) as unknown as itemData[];
      if (this.datas) {
        this.isList = true;
        this.inited = true;
      } else this.inited = false;
      return;
    }

    public async first(): Promise<void> {
      this.data = (await this.queryInfo.first()) as unknown as itemData;
      if (this.data) this.inited = true;
      else this.inited = false;
      return;
    }

    public async delete(): Promise<void> {
      await this.queryInfo.delete();
      this.inited = false;
    }

    public async update(data: { [key: string]: string }): Promise<void> {
      let input = this.getCleanValue(data) as unknown as { [key: string]: string };
      // XXXid updates shoudld be perform on creat
      for (const key in input) if (/id$/gm.test(key)) delete input[key];
      await Item.where("id", this.id).update(input);
      this.inited = false;
    }

    public async create(data: { [key: string]: string }): Promise<void> {
      await Item.create(this.getCleanValue(data));
    }

    public orderBy(fieldName: string | { [key: string]: string }, asc?: string) {
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

    public getSanitzedValue() {
      if (this.isList) return this.datas!.map((item: itemData) => this.sanitize(item));
      return this.sanitize(this.data);
    }

    public async ref(schema: string): Promise<Model[] | Model> {
      console.warn("ref is unsafe.(sanitizing problems)");
      if (schema[schema.length - 1] != "s") schema += "s";
      if (!this.inited) throw new Error("Cannot ref an uninitialized object");
      return (await Item.where("id", this.id)?.[schema]()) as unknown as Model[];
    }

    private sanitize(data = this.data): { [key: string]: string } {
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
