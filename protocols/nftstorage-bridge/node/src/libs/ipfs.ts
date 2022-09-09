import { create } from 'ipfs-core'
import { contract } from "./web3"
import * as Database from "./database"
import * as dotenv from "dotenv"
dotenv.config();

export const run = async () => {
  console.log("Running IPFS node..")
  global['ipfs'] = await create()
  return true
}

export const hash = (buffer) => {
  return new Promise(async (response) => {
    try {
      const calculated = await global['ipfs'].add(buffer, { cidVersion: 1, onlyHash: true })
      response(calculated.cid.toString())
    } catch (e) {
      response(false);
    }
  });
};

export const add = (buffer) => {
  return new Promise(async (response) => {
    try {
      const added = await global['ipfs'].add(buffer, { cidVersion: 1 })
      console.log("[IPFS] Pinning CID:", added.cid.toString())
      response(added.cid.toString())
    } catch (e) {
      response(false);
    }
  });
};

export const unpin = (cid) => {
  return new Promise(async (response) => {
    try {
      console.log("[IPFS] Unpinning CID:", cid)
      const unpinned = await global['ipfs'].pin.rm(cid.replace("ipfs://", ""))
      response(unpinned)
    } catch (e) {
      response(false);
    }
  });
};
