import * as Database from "./libs/database";
import { parseRequests, listenEvents } from "./libs/web3";
import { ipfs, getWeb3Nodes } from "./libs/ipfs"
// Init mongo database
const db = new Database.default.Mongo()
db.createBridgesIndex()

// Main function
async function init() {
  // Adding web3 nodes to swarm
  console.log("Getting nodes from repo..")
  const nodes = await getWeb3Nodes()
  console.log('Found ' + nodes.length + ' nodes.')
  for (let k in nodes) {
    try {
      console.log("Adding " + nodes[k] + " to swarm..")
      await ipfs("post", "/swarm/connect?arg=" + nodes[k])
    } catch (e) {
      console.log("Can't add node to swarm..")
    }
  }
  // Add service to local node
  try {
    console.log("Adding Web3.Storage as remote pinning provider...")
    await ipfs("post", "/pin/remote/service/add?arg=web3_storage&arg=https://api.web3.storage&arg=" + process.env.WEB3_STORAGE_KEY)
  } catch (e) {
    console.log("Remote pinning setted up yet.")
  }
  // Adding listeners to on-chain contract
  listenEvents()
  // Parse past bridges
  parseRequests()
}
init()