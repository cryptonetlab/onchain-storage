import { run, add, hash, parseCache } from "./libs/ipfs"
import * as Database from "./libs/database";
import { parseBridges, parseBridge, listenEvents } from "./libs/web3";
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import multer from 'multer'
import helmet from 'helmet'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
// Init express server
const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Init mongo database
const db = new Database.default.Mongo()
db.createBridgesIndex()

// Automatic parsers
async function init() {
  run()
  listenEvents()
  parseBridges()
  parseCache()
}
init()

// Public endpoints
app.get("/bridges/:address", async function (req, res) {
  const db = new Database.default.Mongo()
  const bridges = await db.find('bridges', { owner: req.params.address }, { timestamp_start: 1 })
  res.send(bridges)
})

// Force parsing of a specifc deal
app.get("/parse/:id", async function (req, res) {
  const deal_id = parseInt(req.params.id)
  console.log('Manual parsing deal #' + deal_id)
  await parseBridge(deal_id)
  const db = new Database.default.Mongo()
  const deal = await db.find('bridges', { index: deal_id })
  res.send(deal)
})

// Add signup endpoint
app.post("/upload", upload.single('file'), async function (req, res) {
  if (req.body.address !== undefined) {
    const cid = await hash(req.file.buffer)
    if (cid !== false) {
      const checkDB = await db.find('cache', { cid: cid })
      if (checkDB === null || (checkDB !== null && checkDB.expired !== undefined && checkDB.expired === true)) {
        const added = await add(req.file.buffer)
        await db.insert('cache', {
          cid: cid,
          address: req.body.address,
          timestamp: new Date().getTime(),
          expired: false
        })
        res.send({ cid: added, error: false })
      } else {
        res.send({ message: "CID already pinned.", cid: cid, error: false })
      }
    } else {
      res.send({ message: "Can't add on IPFS, please retry.", error: true })
    }
  } else {
    res.send({ message: "Malformed request", error: true })
  }
})

// Return IPFS identity
app.get("/ipfs-id", async function (req, res) {
  try {
    const multiAddrs = await global['ipfs'].swarm.localAddrs()
    res.send(multiAddrs)
  } catch (e) {
    res.send({ message: "Multiaddress not available", error: true })
  }
})

// Default endpoint
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.listen(3000, () => {
  console.log(`NftStorageBridge API running.`);
});
