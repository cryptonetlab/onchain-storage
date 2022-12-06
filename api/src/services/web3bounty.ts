import { ethers } from "ethers";
import * as dotenv from "dotenv"
import axios from "axios"
import { ipfs } from "../libs/ipfs"
import { ABI } from "../abis/web3bounty"
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

export const connectWeb3BountyNode = async () => {
  try {
    const w3nodes = await axios.get("https://w3-b.link/ipfs-id")
    for (let k in w3nodes.data) {
      if (w3nodes.data[k].indexOf("127.0.0.1") === -1) {
        console.log("[W3B] Adding node:", w3nodes.data[k])
        await ipfs("post", "/swarm/connect?arg=" + w3nodes.data[k])
      }
    }
  } catch (e) {
    console.log("[W3B] Can't connect to node..")
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
        response({ owner: deal.owner, value: deal.value, timestamp_start: deal.timestamp_start, timestamp_request: deal.timestamp_request, duration: deal.duration, provider: "Web3.Storage" })
      } else {
        response(undefined)
      }
    } catch (e) {
      response(undefined)
    }
  })
}