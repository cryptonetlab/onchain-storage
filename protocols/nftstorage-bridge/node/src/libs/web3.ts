import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
import * as dotenv from "dotenv"
import { unpin } from "./ipfs"
dotenv.config();
let isParsingBridges = false

export const verify = (message, signature) => {
  return new Promise(async (response) => {
    try {
      const verified = await ethers.utils.verifyMessage(message, signature);
      response(verified);
    } catch (e) {
      response(false);
    }
  });
}

export const contract = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
  const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS ?? "",
    ABI,
    wallet
  );
  return { contract, wallet, provider, ethers };
}

export const parseBridge = async (deal_index, proposal_tx = '', accept_tx = '', cancel_tx = '') => {
  return new Promise(async response => {
    const instance = await contract()
    console.log('[DEALS] Parsing deal #' + deal_index)
    const db = new Database.default.Mongo();
    const onchain_deal = await instance.contract.deals(deal_index);
    if (parseInt(onchain_deal.timestamp_request.toString()) > 0) {
      let provider = 'NOT_ACCEPTED'
      try {
        provider = await instance.contract.ownerOf(deal_index);
      } catch (e) {
        console.log('[DEALS] -> Bridge #', deal_index, 'not accepted yet.')
      }

      console.log('[DEALS] -> Provider is:', provider)
      let appeal_requested = 0
      try {
        appeal_requested = await instance.contract.tot_appeals(deal_index)
      } catch (e) {
        console.log('[DEALS] -> Can\'t get number of requested appeals')
      }

      let deal = {
        index: deal_index,
        timestamp_end: "0",
        timestamp_start: onchain_deal.timestamp_start.toString(),
        timestamp_request: onchain_deal.timestamp_request.toString(),
        duration: onchain_deal.duration.toString(),
        deal_uri: onchain_deal.deal_uri,
        owner: onchain_deal.owner,
        value: onchain_deal.value.toString(),
        collateral: onchain_deal.collateral.toString(),
        canceled: onchain_deal.canceled,
        provider: provider,
        appeal: {},
        appeal_requested: appeal_requested,
        proposal_tx: proposal_tx
      }
      deal.timestamp_end = (parseInt(deal.timestamp_start) + parseInt(deal.duration)).toString();
      const checkDB = await db.find('deals', { index: deal_index })
      if (checkDB === null) {
        console.log('[DEALS] --> Inserting new deal')
        let inserted = false
        while (!inserted) {
          await db.insert('deals', deal)
          const checkDB = await db.find('deals', { index: deal_index })
          if (checkDB !== null) {
            inserted = true
          }
        }
      } else {
        console.log('[DEALS] --> Updating deal')
        if (provider !== 'NOT_ACCEPTED') {
          await unpin(deal.deal_uri)
        }
        if (accept_tx === '') {
          accept_tx = checkDB.accept_tx
        }
        if (cancel_tx === '') {
          cancel_tx = checkDB.cancel_tx
        }
        await db.update('deals', { index: deal_index }, { $set: { canceled: deal.canceled, timestamp_start: deal.timestamp_start, timestamp_end: deal.timestamp_end, provider: provider, appeal_requested: deal.appeal_requested, accept_tx: accept_tx, cancel_tx: cancel_tx } })
      }
      response(true)
    } else {
      console.log("[DEALS] -> Bridge index is not valid")
      response(false)
    }
  })
}

export const parseBridges = async () => {
  if (!isParsingBridges) {
    isParsingBridges = true
    const instance = await contract()
    const totalBridges = await instance.contract.bridges_counter()
    console.log("[DEALS] -> Parsing " + totalBridges + " deals to store informations.");
    const db = new Database.default.Mongo();
    for (let k = totalBridges; k >= 1; k--) {
      const deal_index = parseInt(k.toString())
      const checkDB = await db.find('deals', { index: deal_index })
      if (checkDB === null) {
        await parseBridge(deal_index)
      } else if (checkDB.canceled === false) {
        const now = new Date().getTime() / 1000
        const expires_in = parseInt(checkDB.timestamp_end) - now
        if (expires_in > 0 || parseInt(checkDB.timestamp_start) < now) {
          await parseBridge(deal_index)
        } else {
          console.log('[DEALS] --> Bridge expired')
        }
      }
    }
    isParsingBridges = false
    return true
  } else {
    return false
  }
}

export const listenEvents = async () => {
  const instance = await contract()
  console.log('Setting up on-chain event listeners..')
  instance.contract.on("BridgeRequestCreated", async (deal_uri, bridge_id, oracleAddress, contract_address, token_id, event) => {
    console.log("[EVENT] Bridge proposal created")
    const deal_index = parseInt(bridge_id.toString())
    parseBridge(deal_index, event.transactionHash)
  })
  instance.contract.on("BridgeInvalidated", async (bridge_id) => {
    console.log("[EVENT] Bridge invalidated")
    const deal_index = parseInt(bridge_id.toString())
    await parseBridge(deal_index)
  })
}