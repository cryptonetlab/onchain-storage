import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
import * as dotenv from "dotenv"
import axios from "axios"
import { Web3Storage, File } from 'web3.storage'
import { fileTypeFromBuffer } from 'file-type';

dotenv.config();
let isParsingRequests = false

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
  const wallet = new ethers.Wallet(process.env.DEALER_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS ?? "",
    ABI,
    wallet
  );
  return { contract, wallet, provider, ethers };
}

export const parseRequest = async (bridge_index, proposal_tx = '', accept_tx = '', cancel_tx = '') => {
  return new Promise(async response => {
    const instance = await contract()
    console.log('[REQUESTS] Parsing bridge request #' + bridge_index)
    const db = new Database.default.Mongo();
    // Checking if request was parsed yet
    const checkDB = await db.find('requests', { index: bridge_index })
    if (checkDB === null) {
      const onchain_request = await instance.contract.requests(bridge_index);
      if (parseInt(onchain_request.timestamp_request.toString()) > 0 && !onchain_request.canceled) {
        let downloaded = false
        let file_buffer
        try {
          const parsed_uri = onchain_request.data_uri.replace('ipfs://', process.env.IPFS_GATEWAY)
          console.log("[REQUESTS] --> Downloading file from:", parsed_uri)
          const buf = await axios.get(parsed_uri, { responseType: "arraybuffer" })
          console.log("[REQUESTS] --> File downloaded successfully with size:", buf.data.length)
          // TODO: Check max size if needed
          const ft = await fileTypeFromBuffer(buf.data)
          console.log("[REQUESTS] --> File type is:", ft)
          file_buffer = new File(file_buffer, new Date().getTime() + '.' + ft?.ext, { type: ft?.mime })
          downloaded = true
        } catch (e) {
          console.log(e)
        }
        // Be sure file was downloaded correctly
        if (process.env.WEB3_STORAGE_KEY !== undefined && downloaded) {
          let uploaded = false
          let web3storage_response
          try {
            console.log("[REQUESTS] --> Uploading on Web3.storage..")
            const client = new Web3Storage({ token: process.env.WEB3_STORAGE_KEY })
            web3storage_response = await client.put([file_buffer], { wrapWithDirectory: false })
            console.log("[REQUESTS] --> Web3.storage response is:", web3storage_response)
            // Store processed bridge request
            uploaded = true
          } catch (e) {
            console.log(e)
            console.log("[REQUESTS] --> Can't upload on Web3.storage")
          }
          // Accept onchain bridge request
          if (uploaded) {
            let accepted = false
            let accept_tx
            try {
              console.log("[REQUESTS] --> Accepting bridge #", bridge_index)
              accept_tx = await instance.contract.acceptStorageRequest(bridge_index, web3storage_response)
              console.log('[REQUESTS] --> Pending transaction at: ' + accept_tx.hash)
              await accept_tx.wait()
              console.log("[REQUESTS] --> Transaction confirmed")
              accepted = true
            } catch (e) {
              console.log(e)
              console.log("[REQUESTS] --> Can't upload on Web3.storage")
            }

            if (accepted) {
              try {
                let bridge = {
                  index: bridge_index,
                  timestamp_start: onchain_request.timestamp_start.toString(),
                  timestamp_request: onchain_request.timestamp_request.toString(),
                  data_uri: onchain_request.data_uri,
                  contract_address: onchain_request.contract_address,
                  token_id: onchain_request.token_id.toString(),
                  contract_type: onchain_request.contract_type.toString(),
                  canceled: onchain_request.canceled,
                  terminated: onchain_request.terminated,
                  proposal_tx: proposal_tx,
                  web3storage_response: web3storage_response,
                  accept_tx: accept_tx
                }
                console.log('[REQUESTS] --> Inserting new bridge request')
                let inserted = false
                while (!inserted) {
                  await db.insert('requests', bridge)
                  const checkDB = await db.find('requests', { index: bridge_index })
                  if (checkDB !== null) {
                    inserted = true
                  }
                }
                response(true)
              } catch (e) {
                console.log(e)
                console.log("[REQUESTS] --> Can't store on DB")
                response(false)
              }
            } else {
              console.log("[REQUESTS] --> On-chain bridge transaction failed")
              response(false)
            }
          } else {
            console.log("[REQUESTS] --> Upload to Web3.storage failed")
            response(false)
          }
        } else {
          console.log("[REQUESTS] --> Download failed")
          response(false)
        }
      } else {
        console.log("[REQUESTS] -> Bridge index is not valid")
        response(false)
      }
    } else {
      console.log('[REQUESTS] Request #' + bridge_index + ' parsed yet')
      response(false)
    }
  })
}

export const parseRequests = async () => {
  if (!isParsingRequests) {
    isParsingRequests = true
    const instance = await contract()
    const totalRequests = await instance.contract.requests_counter()
    const request_timeout = await instance.contract.request_timeout()
    console.log("[REQUESTS] -> Parsing " + totalRequests + " requests to store informations.");
    const db = new Database.default.Mongo();
    for (let k = totalRequests; k >= 1; k--) {
      const bridge_index = parseInt(k.toString())
      const checkDB = await db.find('requests', { index: bridge_index })
      if (checkDB === null) {
        await parseRequest(bridge_index)
      } else if (checkDB.canceled === false) {
        const now = new Date().getTime() / 1000
        const expires_in = parseInt(checkDB.timestamp_start) + parseInt(request_timeout.toString())
        if (now > expires_in) {
          await parseRequest(bridge_index)
        } else {
          console.log('[REQUESTS] --> Bridge expired')
        }
      }
    }
    isParsingRequests = false
    return true
  } else {
    return false
  }
}

export const listenEvents = async () => {
  const instance = await contract()
  console.log('Setting up on-chain event listeners..')
  // TODO: Check events
  instance.contract.on("BridgeRequestCreated", async (data_uri, bridge_id, oracleAddress, contract_address, token_id, event) => {
    if (!isParsingRequests) {
      console.log("[EVENT] Bridge proposal created")
      const bridge_index = parseInt(bridge_id.toString())
      parseRequest(bridge_index, event.transactionHash)
    }
  })
  instance.contract.on("BridgeRequestCanceled", async (bridge_id, event) => {
    if (!isParsingRequests) {
      console.log("[EVENT] Bridge canceled")
      const bridge_index = parseInt(bridge_id.toString())
      await parseRequest(bridge_index, '', event.transactionHash)
    }
  })
}