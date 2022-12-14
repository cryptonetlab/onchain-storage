import { ethers } from "ethers";
import * as dotenv from "dotenv"
import axios from "axios"
import { ipfs } from "../libs/ipfs"
import { ABI } from "../abis/retriev"
import { protocols } from "../configs"

dotenv.config();

export const contract = async (protocol) => {
  if (protocols[protocol] !== undefined) {
    const provider = new ethers.providers.JsonRpcProvider(protocols[protocol].provider);
    const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
      provider
    );
    const contract = new ethers.Contract(
      protocols[protocol].contract_address,
      ABI,
      wallet
    );
    return { contract, wallet, provider, ethers };
  } else {
    return false;
  }
}

export const connectRetrievNode = async () => {
  try {
    const retrievnodes = await axios.get(process.env.RETRIEV_NODE + "/ipfs-id")
    for (let k in retrievnodes.data) {
      if (retrievnodes.data[k].indexOf("127.0.0.1") === -1) {
        console.log("[RETRIEV] Adding node:", retrievnodes.data[k])
        await ipfs("post", "/swarm/connect?arg=" + retrievnodes.data[k])
      }
    }
  } catch (e) {
    console.log("[RETRIEV] Can't connect to node..")
  }
}

export const returnCid = (protocol, deal_index) => {
  return new Promise(async response => {
    try {
      const instance = <any>await contract(protocol)
      const deal = await instance.contract.deals(deal_index)
      if (deal.data_uri !== undefined) {
        response(deal.data_uri.replace("ipfs://", ""))
      } else {
        response(undefined)
      }
    } catch (e) {
      response(undefined)
    }
  })
}

export const returnDetails = (protocol, deal_index) => {
  return new Promise(async response => {
    try {
      const instance = <any>await contract(protocol)
      const deal = await instance.contract.deals(deal_index)
      if (deal.owner !== undefined) {
        console.log("[RETRIEV] Owner of deal is:", deal.owner)
        let provider = ""
        try {
          provider = await instance.contract.ownerOf(deal_index)
          console.log("[RETRIEV] Provider is:", provider)
        } catch (e) {
          console.log("[RETRIEV] Deal not accepted yet")
        }
        response({ owner: deal.owner, value: deal.value, timestamp_start: deal.timestamp_start, timestamp_request: deal.timestamp_request, duration: deal.duration, provider })
      } else {
        response(undefined)
      }
    } catch (e) {
      response(undefined)
    }
  })
}