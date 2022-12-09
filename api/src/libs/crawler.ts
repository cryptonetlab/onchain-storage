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
    try {
      let cid
      let owner
      let value
      let details
      // Reading on-chain informations
      if (protocol === "retriev-polygon" || protocol === "retriev-goerli") {
        cid = await Retriev.returnCid(protocol, deal_index)
        console.log("[INDEXER] Asking owner of deal #", deal_index, "in protocol", protocol)
        details = <any>await Retriev.returnDetails(protocol, deal_index)
        owner = details.owner
        value = details.value
      } else if (protocol === "web3bounty-polygon" || protocol === "web3bounty-goerli") {
        cid = await Web3Bounty.returnCid(protocol, deal_index)
        console.log("[INDEXER] Asking owner of deal #", deal_index, "in protocol", protocol)
        details = <any>await Web3Bounty.returnDetails(protocol, deal_index)
        owner = details.owner
        value = details.value
      }
      if (cid !== undefined && owner !== undefined && owner !== "0x0000000000000000000000000000000000000000") {
        console.log("[INDEXER] Indexing CID:", cid)
        const db = new Database.default.Mongo();
        // Writing on-chain informations in database
        const checkDB = await db.find("onchain_storage", "metadata", { cid, protocol })
        // console.log("Entry in database is:", checkDB)
        if (checkDB === null || checkDB === false || checkDB === undefined) {
          let values = {}
          values[deal_index] = parseInt(value.toString())
          let details_db = {}
          details.value = parseInt(value.toString())
          details.timestamp_request = details.timestamp_request.toString()
          details.timestamp_start = details.timestamp_start.toString()
          details.duration = details.duration.toString()
          details_db[deal_index] = details
          let stats = {
            cid: cid,
            protocol: protocol,
            deals: [deal_index],
            owners: [owner],
            details: details_db,
            values: values,
            totalValue: parseInt(value.toString())
          }
          await db.insert("onchain_storage", "metadata", stats)
          response({ status: "INDEXED_CORRECTLY", error: false })
        } else if ((checkDB.deals !== undefined && checkDB.deals.indexOf(deal_index) === -1) || (checkDB.owners !== undefined && checkDB.owners.indexOf(owner) === -1) || checkDB.values === undefined || (checkDB.values !== undefined && checkDB.values[deal_index] === undefined)) {
          console.log("[INDEXER] Need to update stats")
          if (checkDB.deals !== undefined && checkDB.deals.indexOf(deal_index) === -1) {
            console.log("[INDEXER] Adding deal in list")
            checkDB.deals.push(deal_index)
            await db.update("onchain_storage", "metadata", { cid, protocol }, { $set: { deals: checkDB.deals } })
          }
          if (checkDB.owners !== undefined && checkDB.owners.indexOf(owner) === -1) {
            console.log("[INDEXER] Adding owner in list")
            checkDB.owners.push(owner)
            await db.update("onchain_storage", "metadata", { cid, protocol }, { $set: { owners: checkDB.owners } })
          }
          if (checkDB.values === undefined || checkDB.values[deal_index] === undefined) {
            console.log("[INDEXER] Adding value")
            let updatedValues = {}
            if (checkDB.values !== undefined && checkDB.values !== false) {
              updatedValues = checkDB.values
            }
            updatedValues[deal_index] = parseInt(value.toString())
            let updatedTotalValue = 0
            if (checkDB.totalValue !== undefined && checkDB.totalValue !== false) {
              updatedTotalValue = checkDB.totalValue
            }
            updatedTotalValue += parseInt(value.toString())
            await db.update("onchain_storage", "metadata", { cid, protocol }, { $set: { values: updatedValues, totalValue: updatedTotalValue } })
          }
        }

        // Updating with last details
        console.log("[INDEXER] Updating details..")
        if (checkDB !== null && checkDB.details !== undefined) {
          let updatedDetails = {}
          if (checkDB.details !== undefined) {
            updatedDetails = checkDB.details
          }
          updatedDetails[deal_index] = details
          updatedDetails[deal_index].value = details.value.toString()
          updatedDetails[deal_index].timestamp_request = details.timestamp_request.toString()
          updatedDetails[deal_index].timestamp_start = details.timestamp_start.toString()
          updatedDetails[deal_index].duration = details.duration.toString()
          await db.update("onchain_storage", "metadata", { cid, protocol }, { $set: { details: updatedDetails } })
        }

        // Check if configuration tracks sizes
        if (process.env.TRACK_SIZES !== undefined && process.env.TRACK_SIZES === "true") {
          try {
            if (checkDB.size === undefined) {
              const file_stats = <any>await ipfs("post", "/files/stat?arg=/ipfs/" + cid.replace("ipfs://", ""))
              if (file_stats !== false) {
                if (file_stats.Type === 'file') {
                  const buf = await axios.get("http://localhost:8080/ipfs/" + cid, { responseType: "arraybuffer" })
                  const ft = <any>await fileTypeFromBuffer(buf.data)
                  console.log("[INDEXER] File type is:", ft)
                  file_stats.Ext = ft?.ext
                  file_stats.Mime = ft?.mime
                }
                await db.update("onchain_storage", "metadata", { cid, protocol }, {
                  $set: {
                    cid: cid,
                    size: file_stats.Size,
                    cumulative_size: file_stats.CumulativeSize,
                    type: file_stats.Type,
                    ext: file_stats.Ext,
                    mime: file_stats.Mime
                  }
                })
                response({ status: "INDEXED_CORRECTLY", error: false })
              } else {
                response({ status: "FILE_UNRETRIEVABLE", error: true })
              }
            } else {
              response({ status: "UPDATED_CORRECTLY", error: false })
            }
          } catch (e) {
            console.log("[INDEXER] Indexer errored:", e.message)
            response({ status: "INDEXER_ERROR", error: true })
          }
        } else {
          response({ status: "PROCESSED_CORRECTLY", error: false })
        }
      } else {
        response({ status: "DEAL_NOT_EXISTS", error: true })
      }
    } catch (e) {
      console.log("Indexing service errored:", e)
      response(false)
    }
  })
}