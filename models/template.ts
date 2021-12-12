function getSchemaLayer(Item: any, limitFields?: { secretData: string[]; addOnData: string[] }) {
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
    public dataArr: itemData[] = [];

    constructor(data?: itemData) {
      if (data) {
        this.data = data;
        this.inited = true;
      }
    }

    public async where(fieldName: string | { [key: string]: string }, fieldValue?: string): Promise<void> {
      if (this.inited) throw Error("Item has already been initialized");
      if (typeof fieldName === "string") this.data = (await Item.where(fieldName, fieldValue!).first()) as unknown as itemData;
      else this.data = (await Item.where(fieldName as { [key: string]: string }).first()) as unknown as itemData;
      if (this.data) this.inited = true;
      // console.log(await Item.where(fieldName as { [key: string]: string }).first());
      return;
    }

    public async find(id: number): Promise<void> {
      if (!this.inited) {
        this.data = (await Item.find(id)) as any;
        if (this.data) this.inited = true;
      } else throw Error("Item has already been initialized");
    }

    public async delete(id: number = this.data!.id): Promise<void> {
      if (!this.inited) throw Error("Item hasn't been initialized");
      await Item.where("id", id.toString()).delete();
    }

    public async orderBy(fieldName: string, order: "asc" | "desc" = "asc", limit = 10): Promise<void> {
      this.dataArr = ((await Item.orderBy(fieldName, order).limit(limit).all()) as any).map((x: itemData) => this.sanitize(x));
      return;
    }

    public sanitize(data: itemData = this.data!): { [key: string]: string } {
      let input = data as unknown as { [key: string]: string };
      let output: { [key: string]: string } = {};
      for (const key in input) if (publicData.includes(key)) output[key] = input[key];
      return output;
    }

    public async update(data: { [key: string]: string }): Promise<void> {
      if (!this.inited) throw Error("Item hasn't been initialized");
      await Item.where("id", this.data!.id.toString()).update(this.getCleanValue(data) as unknown as { [key: string]: string });
    }

    public async create(data: { [key: string]: string }): Promise<void> {
      await Item.create(this.getCleanValue(data) as any);
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
