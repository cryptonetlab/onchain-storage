import { MongoClient } from "mongodb";
import * as dotenv from "dotenv"
dotenv.config();
module Database {
  export class Mongo {
    client: any;
    dbOptions: any = {
      useUnifiedTopology: true,
      //   sslValidate: false,
      //   sslCA: "./ca-certificate.crt",
      //   sslCA: "./" + process.env.ENVIRONMENT + "-ca.crt"
    };

    public find(database, collection, query = {}, sort?): any {
      return new Promise(async (response) => {
        try {
          let dbname = process.env[database.toUpperCase()]
          let connection = process.env[database.toUpperCase() + "_CONNECTION"]
          if (connection !== undefined && dbname !== undefined) {
            let client = new MongoClient(
              connection,
              this.dbOptions
            );
            await client.connect();
            const db = await client.db(dbname);
            let result;
            if (sort !== undefined) {
              result = await db
                .collection(collection)
                .find(query)
                .sort(sort)
                .toArray();
            } else {
              result = await db.collection(collection).findOne(query);
            }
            await client.close();
            response(result);
          } else {
            response(false);
          }
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE FINDING.");
        }
      });
    }

    public insert(database, collection, document): any {
      return new Promise(async (response) => {
        try {
          let dbname = process.env[database.toUpperCase()]
          let connection = process.env[database.toUpperCase() + "_CONNECTION"]
          if (connection !== undefined && dbname !== undefined) {
            let client = new MongoClient(
              connection,
              this.dbOptions
            );
            await client.connect();
            const db = await client.db(dbname);
            let result = await db.collection(collection).insertOne(document);
            await client.close();
            response(result);
          } else {
            response(false)
          }
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE INSERTING.");
          response(false);
        }
      });
    }

    public update(database, collection, query, document): any {
      return new Promise(async (response) => {
        try {
          let dbname = process.env[database.toUpperCase()]
          let connection = process.env[database.toUpperCase() + "_CONNECTION"]
          if (connection !== undefined && dbname !== undefined) {
            let client = new MongoClient(
              connection,
              this.dbOptions
            );
            await client.connect();
            const db = await client.db(dbname);
            await db.collection(collection).updateOne(query, document);
            let result = await db.collection(collection).findOne(query, document);
            await client.close();
            response(result);
          } else {
            response(false)
          }
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE UPDATING.");
          response(false);
        }
      });
    }

    public createMetadataIndex() {
      return new Promise(async (response) => {
        try {
          // let ssl = "?ssl=true";
          // if (process.env.MONGODB_CONNECTION?.indexOf("localhost") !== -1) {
          //   ssl = "";
          // }
          let client = new MongoClient(
            process.env.ONCHAIN_STORAGE_CONNECTION || "",
            this.dbOptions
          );
          await client.connect();
          const db = await client.db(process.env.ONCHAIN_STORAGE);
          let createIndex = await db.collection("metadata").createIndex({
            cid: "text",
            protocol: "text"
          });
          await client.close();
          response(createIndex);
        } catch (e) {
          console.log(e);
          console.log("DB ERROR WHILE ADDING INDEX.");
          response(false);
        }
      });
    }

  }
}

export default Database;
