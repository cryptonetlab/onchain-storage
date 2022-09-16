import * as Database from "./libs/database";
import { parseRequests, listenEvents } from "./libs/web3";

// Init mongo database
const db = new Database.default.Mongo()
db.createBridgesIndex()

// Main function
async function init() {
  // Adding listeners to on-chain contract
  listenEvents()
  // Parse past bridges
  parseRequests()
}
init()