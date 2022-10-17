import * as Database from "./database";
import { fileTypeFromBuffer } from 'file-type';
import * as dotenv from "dotenv"
import { ipfs } from "./ipfs"
import axios from "axios"
dotenv.config();
import { protocols } from "../configs"
import * as Retriev from "../services/retrievalpinning"
import * as Web3Bounty from "../services/web3bounty"

export const index = (deal_index, protocol) => {
  return new Promise(async response => {
    let cid
    let owner
    if (protocol === "retriev-polygon" || protocol === "retriev-goerli") {
      cid = await Retriev.returnCid(protocol, deal_index)
      owner = await Retriev.returnOwner(protocol, deal_index)
    } else if (protocol === "web3bounty-polygon" || protocol === "web3bounty-goerli") {
      cid = await Web3Bounty.returnCid(protocol, deal_index)
      owner = await Web3Bounty.returnOwner(protocol, deal_index)
    }
    if (cid !== undefined && owner !== undefined && owner !== "0x0000000000000000000000000000000000000000") {
      console.log("[INDEXER] Indexing CID:", cid)
      const db = new Database.default.Mongo();
      try {
        const file_stats = <any>await ipfs("post", "/files/stat?arg=/ipfs/" + cid.replace("ipfs://", ""))
        if (file_stats !== false) {
          const checkDB = await db.find("metadata", { cid, protocol })
          if (checkDB === null) {
            if (file_stats.Type === 'file') {
              const buf = await axios.get("http://localhost:8080/ipfs/" + cid, { responseType: "arraybuffer" })
              const ft = <any>await fileTypeFromBuffer(buf.data)
              console.log("[INDEXER] File type is:", ft)
              file_stats.Ext = ft.ext
              file_stats.Mime = ft.mime
            }
            console.log("[INDEXER] Asking of owner..")
            if (owner !== undefined) {
              let stats = {
                cid: cid,
                size: file_stats.Size,
                cumulative_size: file_stats.CumulativeSize,
                type: file_stats.Type,
                ext: file_stats.Ext,
                mime: file_stats.Mime,
                protocol: protocol,
                owner: owner,
                deals: [deal_index]
              }
              await db.insert("metadata", stats)
              response("INDEXED_CORRECTLY")
            } else {
              response("CONTRACT_ERROR")
            }
          } else if (checkDB.deals.indexOf(deal_index) === -1) {
            checkDB.deals.push(deal_index)
            await db.update("metadata", { cid, protocol }, { $set: { deals: checkDB.deals } })
            console.log("[INDEXER] Adding deal in list")
            response("UPDATED_CORRECTLY")
          } else {
            response("INDEXED_YET")
          }
        } else {
          response("FILE_UNRETRIEVABLE")
        }
      } catch (e) {
        console.log(e)
        response("INDEXER_ERROR")
      }
    } else {
      response("DEAL_NOT_EXISTS")
    }
  })
}