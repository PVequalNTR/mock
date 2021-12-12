import Post from "../db/schemas/Post.ts";
import getSchemaLayer from "./template.ts";

export default getSchemaLayer(Post, { secretData: ["privilege", "path"], addOnData: ["userId"] });

// type fixType = {
//   id: number;
// };
// type inherentType = typeof Post.defaults;
// interface postData extends inherentType, fixType {}

// const secretData = ["privilege", "path"]; //secret
// let requiredData: string[] = []; //all(public+secret)
// let publicData: string[] = []; //public
// const addOnData: string[] = ["userId"]; //addOn

// for (const key in Post.fields) {
//   requiredData.push(key);
//   if (!secretData.includes(key)) publicData.push(key);
// }

// requiredData = requiredData.concat(addOnData);
// publicData = publicData.concat(addOnData);

// class objPost {
//   public inited = false;
//   public data?: postData;
//   public dataArr: postData[] = [];

//   constructor(data?: postData) {
//     if (data) {
//       this.data = data;
//       this.inited = true;
//     }
//   }

//   public async where(fieldName: string | { [key: string]: string }, fieldValue?: string): Promise<void> {
//     if (this.inited) throw Error("Post has already been initialized");
//     if (typeof fieldName === "string") this.data = (await Post.where(fieldName, fieldValue!).first()) as unknown as postData;
//     else this.data = (await Post.where(fieldName as { [key: string]: string }).first()) as unknown as postData;
//     if (this.data) this.inited = true;
//     // console.log(await Post.where(fieldName as { [key: string]: string }).first());
//     return;
//   }

//   public async find(id: number): Promise<void> {
//     if (!this.inited) {
//       this.data = (await Post.find(id)) as any;
//       if (this.data) this.inited = true;
//     } else throw Error("Post has already been initialized");
//   }

//   public async delete(id: number = this.data!.id): Promise<void> {
//     if (!this.inited) throw Error("Post hasn't been initialized");
//     await Post.where("id", id.toString()).delete();
//   }

//   public async orderBy(fieldName: string, order: "asc" | "desc" = "asc", limit = 10): Promise<void> {
//     this.dataArr = ((await Post.orderBy(fieldName, order).limit(limit).all()) as any).map((x: postData) => this.sanitize(x));
//     return;
//   }

//   public sanitize(data: postData = this.data!): { [key: string]: string } {
//     let input = data as unknown as { [key: string]: string };
//     let output: { [key: string]: string } = {};
//     for (const key in input) if (publicData.includes(key)) output[key] = input[key];
//     return output;
//   }

//   public async update(data: { [key: string]: string }): Promise<void> {
//     if (!this.inited) throw Error("Post hasn't been initialized");
//     await Post.where("id", this.data!.id.toString()).update(this.getCleanValue(data) as unknown as { [key: string]: string });
//   }

//   public async create(data: { [key: string]: string }): Promise<void> {
//     await Post.create(this.getCleanValue(data) as any);
//   }

//   private getCleanValue(data: { [key: string]: string }): postData {
//     let output = data;
//     for (const key in output) if (!requiredData.includes(key)) delete output[key];
//     if (output.id) delete output.id;
//     return output as unknown as postData;
//   }
// }

// export default objPost;
