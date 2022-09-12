import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
import * as dotenv from "dotenv"
import axios from "axios"
import { NFTStorage, File } from 'nft.storage'
import { fileTypeFromBuffer } from 'file-type';

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

export const parseBridge = async (bridge_index, proposal_tx = '', accept_tx = '', cancel_tx = '') => {
  return new Promise(async response => {
    const instance = await contract()
    console.log('[BRIDGES] Parsing bridge request #' + bridge_index)
    const db = new Database.default.Mongo();
    // Checking if request was parsed yet
    const checkDB = await db.find('bridges', { index: bridge_index })
    if (checkDB === null) {
      const onchain_request = await instance.contract.bridges(bridge_index);
      if (parseInt(onchain_request.timestamp_request.toString()) > 0 && !onchain_request.canceled) {
        let downloaded = false
        let nft_metadata
        try {
          const parsed_metadata_uri = onchain_request.deal_uri.replace('ipfs://', process.env.IPFS_GATEWAY)
          console.log("[BRIDGES] --> Downloading metadata from:", parsed_metadata_uri)
          const metadata = await axios.get(parsed_metadata_uri)
          nft_metadata = metadata.data
          console.log("[BRIDGES] --> Metadata downloaded successfully:", nft_metadata)
        } catch (e) {
          console.log(e)
        }
        try {
          if (nft_metadata.image !== undefined) {
            const parsed_image_uri = nft_metadata.image.replace('ipfs://', process.env.IPFS_GATEWAY)
            console.log("[BRIDGES] --> Downloading image from:", parsed_image_uri)
            const image = await axios.get(parsed_image_uri, { responseType: "arraybuffer" })
            console.log("[BRIDGES] --> Image downloaded correctly, weight is:", image.data.length, "bytes")
            const ft = await fileTypeFromBuffer(image.data)
            console.log("[BRIDGES] --> File type is:", ft)
            nft_metadata.image = new File(image.data, new Date().getTime() + '.' + ft?.ext, { type: ft?.mime })
            downloaded = true
          }
        } catch (e) {
          console.log(e)
        }
        // Be sure NFT was downloaded correctly
        if (process.env.NFT_STORAGE_KEY !== undefined && downloaded) {
          let uploaded = false
          let nftstorage_response
          try {
            console.log("[BRIDGES] --> Uploading on NFT.storage..")
            const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })
            nftstorage_response = await client.store(nft_metadata)
            console.log("[BRIDGES] --> NFT.storage response is:", nftstorage_response)
            // Store processed bridge request
            uploaded = true
          } catch (e) {
            console.log(e)
            console.log("[BRIDGES] --> Can't upload on NFT.storage")
          }
          // Accept onchain bridge request
          if (uploaded) {
            let accepted = false
            let accept_tx
            try {
              console.log("[BRIDGES] --> Accepting bridge #", bridge_index)
              accept_tx = await instance.contract.acceptBridge(bridge_index, nftstorage_response.ipnft)
              console.log('[BRIDGES] --> Pending transaction at: ' + accept_tx.hash)
              await accept_tx.wait()
              console.log("[BRIDGES] --> Transaction confirmed")
              accepted = true
            } catch (e) {
              console.log(e)
              console.log("[BRIDGES] --> Can't upload on NFT.storage")
            }

            if (accepted) {
              try {
                let bridge = {
                  index: bridge_index,
                  timestamp_start: onchain_request.timestamp_start.toString(),
                  timestamp_request: onchain_request.timestamp_request.toString(),
                  deal_uri: onchain_request.deal_uri,
                  contract_address: onchain_request.contract_address,
                  token_id: onchain_request.token_id.toString(),
                  contract_type: onchain_request.contract_type.toString(),
                  canceled: onchain_request.canceled,
                  terminated: onchain_request.terminated,
                  proposal_tx: proposal_tx,
                  nftstorage_response: nftstorage_response,
                  accept_tx: accept_tx
                }
                console.log('[BRIDGES] --> Inserting new bridge request')
                let inserted = false
                while (!inserted) {
                  await db.insert('bridges', bridge)
                  const checkDB = await db.find('bridges', { index: bridge_index })
                  if (checkDB !== null) {
                    inserted = true
                  }
                }
                response(true)
              } catch (e) {
                console.log(e)
                console.log("[BRIDGES] --> Can't store on DB")
                response(false)
              }
            } else {
              console.log("[BRIDGES] --> On-chain bridge transaction failed")
              response(false)
            }
          } else {
            console.log("[BRIDGES] --> Upload to NFT.storage failed")
            response(false)
          }
        } else {
          console.log("[BRIDGES] --> NFT download failed")
          response(false)
        }
      } else {
        console.log("[BRIDGES] -> Bridge index is not valid")
        response(false)
      }
    } else {
      console.log('[BRIDGES] Request #' + bridge_index + ' parsed yet')
      response(false)
    }
  })
}

export const parseBridges = async () => {
  if (!isParsingBridges) {
    isParsingBridges = true
    const instance = await contract()
    const totalBridges = await instance.contract.bridges_counter()
    const request_timeout = await instance.contract.request_timeout()
    console.log("[BRIDGES] -> Parsing " + totalBridges + " bridges to store informations.");
    const db = new Database.default.Mongo();
    for (let k = totalBridges; k >= 1; k--) {
      const bridge_index = parseInt(k.toString())
      const checkDB = await db.find('bridges', { index: bridge_index })
      if (checkDB === null) {
        await parseBridge(bridge_index)
      } else if (checkDB.canceled === false) {
        const now = new Date().getTime() / 1000
        const expires_in = parseInt(checkDB.timestamp_start) + parseInt(request_timeout.toString())
        if (now > expires_in) {
          await parseBridge(bridge_index)
        } else {
          console.log('[BRIDGES] --> Bridge expired')
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
    if (!isParsingBridges) {
      console.log("[EVENT] Bridge proposal created")
      const bridge_index = parseInt(bridge_id.toString())
      parseBridge(bridge_index, event.transactionHash)
    }
  })
  instance.contract.on("BridgeRequestCanceled", async (bridge_id, event) => {
    if (!isParsingBridges) {
      console.log("[EVENT] Bridge canceled")
      const bridge_index = parseInt(bridge_id.toString())
      await parseBridge(bridge_index, '', event.transactionHash)
    }
  })
}