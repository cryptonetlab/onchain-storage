import * as Database from "./libs/database";
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import { connectWeb3BountyNode } from "./services/web3bounty"
import { connectRetrievNode } from "./services/retrievalpinning"
import { ipfs } from "./libs/ipfs"
import { index } from "./libs/crawler"
import { protocols } from "./configs"

// Init express server
const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Init protocols
async function init() {
  connectWeb3BountyNode()
  connectRetrievNode()
}
init()

// Init mongo database
const db = new Database.default.Mongo()
db.createMetadataIndex()

// Return IPFS identity
app.get("/ipfs-id", async function (req, res) {
  try {
    const id = <any>await ipfs("post", "/id")
    const multiAddrs = <any>await ipfs("post", "/swarm/addrs/local")
    let addresses = <any>[]
    for (let k in multiAddrs.Strings) {
      addresses.push(multiAddrs.Strings[k] + "/p2p/" + id.ID)
    }
    res.send(addresses)
  } catch (e) {
    res.send({ message: "Multiaddress not available", error: true })
  }
})

// Index a specific deal id
app.get("/index/:protocol/:deal_id", async function (req, res) {
  try {
    if (protocols[req.params.protocol] !== undefined) {
      const indexed = await index(req.params.deal_id, req.params.protocol)
      res.send({ status: indexed, error: false })
    } else {
      res.send({ message: "Protocol not recognized", error: true })
    }
  } catch (e) {
    res.send({ message: "Can't index CID", error: true })
  }
})

// Return CID metadata
app.get("/metadata/:cid", async function (req, res) {
  try {
    const db = new Database.default.Mongo();
    const metadata = await db.find("metadata", { cid: req.params.cid })
    if (metadata !== null) {
      res.send({ message: "CID's metadata found.", metadata, error: false })
    } else {
      res.send({ message: "Can't find CID's metadata.", error: true })
    }
  } catch (e) {
    res.send({ message: "Can't return CID's metadata", error: true })
  }
})

// Return CID metadata
app.get("/stats/:protocol", async function (req, res) {
  try {
    const db = new Database.default.Mongo();
    const metadata = await db.find("metadata", { protocol: req.params.protocol }, { cid: 1 })
    let size = 0
    let indexed = 0
    for (let k in metadata) {
      size += metadata[k].size
      indexed++
    }
    res.send({ indexed, size, sizeMB: size / 1000000 })
  } catch (e) {
    res.send({ message: "Can't return CID's metadata", error: true })
  }
})

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3000, () => {
  console.log(`Onchain.Storage API running.`);
});
