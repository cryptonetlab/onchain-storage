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
      console.log("[INDEXER] Starting index process..")
      const indexed = await index(req.params.deal_id, req.params.protocol)
      res.send(indexed)
    } else {
      res.send({ message: "Protocol not recognized", error: true })
    }
  } catch (e) {
    res.send({ message: "Can't index CID", error: true })
  }
})

// Return CID metadata
app.get("/metadata/:blockchain/:cid", async function (req, res) {
  try {
    const db = new Database.default.Mongo();
    const cids = await db.find("onchain_storage", "metadata", { protocol: new RegExp('.*' + req.params.blockchain + '.*'), cid: req.params.cid }, { cid: 1 })
    if (cids !== null) {
      const now = new Date().getTime()
      let parsed = {
        metadata: {},
        value: 0,
        active: 0,
        total: 0,
        deals: {},
        protocols: <any>[]
      }
      for (let k in cids) {
        if (Object.keys(parsed.metadata).length === 0) {
          parsed.metadata = { ext: cids[k].ext, mime: cids[k].mime, size: cids[k].size, type: cids[k].type }
        }
        parsed.value += parseInt(cids[k].totalValue)
        for (let j in cids[k].details) {
          let deal = cids[k].details[j]
          deal.deal_index = j
          parsed.total++
          let expiration = (parseInt(deal.timestamp_start) + parseInt(deal.duration)) * 1000
          deal.expiration = expiration.toString()
          if (now < expiration) {
            parsed.active++
          }
          if (parsed.deals[deal.owner] === undefined) {
            parsed.deals[deal.owner] = []
          }
          if (parsed.protocols.indexOf(cids[k].protocol) === -1) {
            parsed.protocols.push(cids[k].protocol)
          }
          parsed.deals[deal.owner].push(deal)
        }
      }
      res.send(parsed)
    } else {
      res.send({ message: "Can't find CID's metadata.", error: true })
    }
  } catch (e) {
    console.log(e)
    res.send({ message: "Can't return CID's metadata", error: true })
  }
})

// Return address stats
app.get("/stats/:protocol/:address", async function (req, res) {
  try {
    const db = new Database.default.Mongo();
    const metadata = await db.find("onchain_storage", "metadata", { protocol: req.params.protocol, owners: { $in: [req.params.address] } }, { cid: 1 })
    let size = 0
    let indexed = 0
    let value = 0
    for (let k in metadata) {
      size += metadata[k].size
      value += metadata[k].totalValue
      indexed++
    }
    res.send({ indexed, size, conversions: { mb: size / 1000000, gb: size / 1000000000, tb: size / 1000000000000 } })
  } catch (e) {
    res.send({ message: "Can't return CID's metadata", error: true })
  }
})

// Return protocol stats
app.get("/stats/:protocol", async function (req, res) {
  try {
    const db = new Database.default.Mongo();
    const metadata = await db.find("onchain_storage", "metadata", { protocol: req.params.protocol }, { cid: 1 })
    let size = 0
    let indexed = 0
    for (let k in metadata) {
      size += metadata[k].size
      indexed++
    }
    res.send({ indexed, size, conversions: { mb: size / 1000000, gb: size / 1000000000, tb: size / 1000000000000 } })
  } catch (e) {
    console.log(e)
    res.send({ message: "Can't return stats", error: true })
  }
})

// Return cid list by owner
app.get("/list/:blockchain/:address", async function (req, res) {
  try {
    const db = new Database.default.Mongo();
    const list = await db.find("onchain_storage", "metadata", { protocol: new RegExp('.*' + req.params.blockchain + '.*'), owners: { $in: [req.params.address] } }, { cid: 1 })
    let size = 0
    let active = 0
    let total = 0
    let value = 0
    let protocols = <any>[]
    let parsed = {}
    const now = new Date().getTime()
    for (let k in list) {
      size += list[k].size
      let filtered = {}
      if (Object.keys(list[k].details).length > 0) {
        for (let j in list[k].details) {
          value += parseInt(list[k].details[j].value)
          if (list[k].details[j].owner.toLowerCase() === req.params.address.toLowerCase()) {
            filtered[j] = list[k].details[j]
            filtered[j].protocol = list[k].protocol
            filtered[j].deal_index = j
            total++
            let expiration = (parseInt(filtered[j].timestamp_start) + parseInt(filtered[j].duration)) * 1000
            filtered[j].expiration = expiration.toString()
            if (now < expiration) {
              filtered[j].left = (filtered[j].expiration - now).toString()
              active++
            } else {
              filtered[j].left = '0'
            }
          }
        }
        if (Object.keys(filtered).length > 0) {
          if (protocols.indexOf(<any>list[k].protocol) === -1) {
            protocols.push(list[k].protocol)
          }
          if (parsed[list[k].cid] === undefined) {
            parsed[list[k].cid] = { metadata: { ext: list[k].ext, mime: list[k].mime, size: list[k].size, type: list[k].type }, deals: [] }
          }
          for (let f in filtered) {
            parsed[list[k].cid].deals.push(filtered[f])
          }
        }
      }
    }
    res.send({ value, active, total, protocols, list: parsed, size, conversions: { mb: size / 1000000, gb: size / 1000000000, tb: size / 1000000000000 } })
  } catch (e) {
    console.log(e)
    res.send({ message: "Can't return CID list", error: true })
  }
})

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(5000, () => {
  console.log(`Onchain.Storage API running.`);
});
