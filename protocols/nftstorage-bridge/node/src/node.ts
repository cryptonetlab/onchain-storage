import { run } from "./libs/ipfs"
import * as Database from "./libs/database";
import { parseBridges, listenEvents } from "./libs/web3";

// Init mongo database
const db = new Database.default.Mongo()
db.createBridgesIndex()

// Main function
async function init() {
  // Run IPFS node
  run()
  // Adding listeners to on-chain contract
  listenEvents()
  // Parse past bridges
  parseBridges()
}
init()