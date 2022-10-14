import { ethers } from "ethers";
import { ABI } from "./abi";
import * as Database from "./database";
import * as dotenv from "dotenv"
import axios from "axios"
import { ipfs } from "./ipfs"
import { Web3Storage, File } from 'web3.storage'
import { fileTypeFromBuffer } from 'file-type';
import FormData from "form-data"

dotenv.config();
let isParsingRequests = false

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

export const updateRequest = async (deal_proposal_index, proposal_tx = '', accept_tx = '') => {
  return new Promise(async response => {
    const instance = await contract()
    console.log('[REQUESTS] Parsing bridge request #' + deal_proposal_index)
    const db = new Database.default.Mongo();
    // Checking if request was parsed yet
    const checkDB = await db.find('requests', { index: deal_proposal_index })
    const onchain_request = await instance.contract.deals(deal_proposal_index);
    if (checkDB === null) {
      console.log("[API] Insering request in database..")
      if (onchain_request.canceled === true) {
        console.log("[IPFS] Unpinning element from IPFS..")
        ipfs("post", "/pin/remote/add?arg=" + onchain_request.data_uri.replace("ipfs://", "/ipfs/") + '&service=web3_storage&recursive=true')
        ipfs("post", "/pin/rm?arg=" + onchain_request.data_uri.replace("ipfs://", "/ipfs/") + '&recursive=true')
      }
      let deal_proposal = {
        owner: onchain_request.owner,
        index: deal_proposal_index,
        timestamp_start: onchain_request.timestamp_start.toString(),
        timestamp_request: onchain_request.timestamp_request.toString(),
        data_uri: onchain_request.data_uri,
        canceled: onchain_request.canceled,
        proposal_tx: proposal_tx,
        accept_tx: accept_tx
      }
      console.log('[REQUESTS] --> Inserting new deal proposal')
      let inserted = false
      while (!inserted) {
        await db.insert('requests', deal_proposal)
        const checkDB = await db.find('requests', { index: deal_proposal_index })
        if (checkDB !== null) {
          inserted = true
        }
      }
    } else {
      if (proposal_tx === '') {
        proposal_tx = checkDB.proposal_tx
      }
      if (proposal_tx === '') {
        accept_tx = checkDB.accept_tx
      }
      await db.update('requests', { index: deal_proposal_index }, {
        $set: {
          timestamp_start: onchain_request.timestamp_start.toString(),
          canceled: onchain_request.canceled,
          proposal_tx: proposal_tx,
          accept_tx: accept_tx
        }
      })
    }
    response(true)
  })
}

export const parseRequest = async (deal_proposal_index, proposal_tx = '') => {
  return new Promise(async response => {
    if (process.env.WEB3_STORAGE_KEY !== undefined) {
      const instance = await contract()
      console.log('[REQUESTS] Parsing bridge request #' + deal_proposal_index)
      const db = new Database.default.Mongo();
      // Checking if request was parsed yet
      const checkDB = await db.find('requests', { index: deal_proposal_index })
      if (checkDB === null || (checkDB !== null && checkDB.accept_tx === undefined && checkDB.missing_policy === undefined)) {
        const onchain_request = await instance.contract.deals(deal_proposal_index);
        // Be sure request is in the database
        await updateRequest(deal_proposal_index, proposal_tx)
        if (parseInt(onchain_request.timestamp_start.toString()) === 0 && parseInt(onchain_request.timestamp_request.toString()) > 0 && !onchain_request.canceled) {
          let downloaded = false
          let files
          let filebuffer
          let filename
          try {
            const parsed_uri = onchain_request.data_uri.replace('ipfs://', process.env.IPFS_GATEWAY)
            console.log("[REQUESTS] --> Downloading file from:", parsed_uri)
            const buf = await axios.get(parsed_uri, { responseType: "arraybuffer" })
            console.log("[REQUESTS] --> File downloaded successfully with size:", buf.data.length)
            // Check max size if needed: 100M by default
            if (buf.data.length < 100000000) {
              const ft = await fileTypeFromBuffer(buf.data)
              console.log("[REQUESTS] --> File type is:", ft)
              filename = process.env.CONTRACT_ADDRESS + "_DEAL_" + deal_proposal_index + '.' + ft?.ext
              files = [new File([buf.data], filename)]
              filebuffer = buf.data
              downloaded = true
            } else {
              console.log("[REQUESTS] --> Can't accept file too big.")
              await db.update('requests', { index: deal_proposal_index }, { $set: { missing_policy: true } })
            }
          } catch (e) {
            console.log(e)
          }
          // Be sure file was downloaded correctly
          if (downloaded) {
            let uploaded = false
            let pinned = false
            let backupped = false
            let web3storage_response
            try {
              console.log("[REQUESTS] --> Uploading on Web3.storage..")
              const client = new Web3Storage({ token: process.env.WEB3_STORAGE_KEY })
              web3storage_response = await client.put(files)
              console.log("[REQUESTS] --> web3.storage response is:", web3storage_response)
              // Store processed bridge request
              uploaded = true
            } catch (e) {
              console.log(e)
              console.log("[REQUESTS] --> Can't upload on web3.storage")
            }
            // Backup on local node
            try {
              console.log('[REQUESTS] Uploading on local node...')
              const formData = new FormData();
              formData.append("file", filebuffer, { filename });
              const backup = await axios({
                method: "post",
                url: "http://localhost:5001/api/v0/add?cid-version=1",
                data: formData,
                headers: {
                  "Content-Type": "multipart/form-data;boundary=" + formData.getBoundary(),
                },
              })
              if (backup.data !== undefined) {
                console.log("[REQUESTS] --> Backup on local node confirmed")
                backupped = true
              } else {
                console.log("[REQUESTS] Backup on local node failed")
              }
            } catch (e) {
              console.log(e)
              console.log("[REQUESTS] --> Can't pin on local node")
            }
            // Pinning on the API
            try {
              console.log("[REQUESTS] Remote pinning on web3.storage")
              ipfs("post", "/pin/remote/add?arg=" + onchain_request.data_uri.replace("ipfs://", "/ipfs/") + '&service=web3_storage&recursive=true')
              pinned = true
            } catch (e) {
              console.log(e)
              console.log("[REQUESTS] --> Can't pin on web3.storage")
            }
            // Store on database
            if (uploaded && pinned && backupped) {
              let accepted = false
              let accept_tx
              try {
                console.log("[REQUESTS] --> Accepting bridge #", deal_proposal_index)
                const gasPrice = (await instance.provider.getGasPrice()).mul(2)
                console.log("Gas price is:", gasPrice)
                accept_tx = await instance.contract.acceptDealProposal(deal_proposal_index, { gasPrice })
                console.log('[REQUESTS] --> Pending transaction at: ' + accept_tx.hash)
                await accept_tx.wait()
                console.log("[REQUESTS] --> Transaction confirmed")
                accepted = true
              } catch (e) {
                console.log(e)
                console.log("[REQUESTS] --> Can't send on-chain transaction")
              }

              if (accepted) {
                try {
                  console.log('[REQUESTS] --> Updating bridge request')
                  await db.update('requests', { index: deal_proposal_index }, {
                    $set: {
                      accept_tx
                    }
                  })
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
              console.log("[REQUESTS] --> All or one upload failed")
              response(false)
            }
          } else {
            console.log("[REQUESTS] --> Download failed")
            response(false)
          }
        } else {
          console.log("[REQUESTS] -> Can't accept deal, probably started or canceled")
          response(false)
        }
      } else {
        console.log('[REQUESTS] Request #' + deal_proposal_index + ' parsed yet')
        response(false)
      }

    } else {
      console.log("[REQUESTS] Can't process requests, web3.storage key is not defined")
    }
  })
}

export const parseRequests = async () => {
  if (!isParsingRequests) {
    isParsingRequests = true
    const instance = await contract()
    const totalRequests = await instance.contract.deals_counter()
    const request_timeout = await instance.contract.request_timeout()
    console.log("[REQUESTS] -> Parsing " + totalRequests + " requests to store informations.");
    const db = new Database.default.Mongo();
    for (let k = totalRequests; k >= 1; k--) {
      const deal_proposal_index = parseInt(k.toString())
      const checkDB = await db.find('requests', { index: deal_proposal_index })
      if (checkDB === null) {
        await parseRequest(deal_proposal_index)
      } else if (checkDB.canceled === false) {
        const now = new Date().getTime() / 1000
        const expires_in = parseInt(checkDB.timestamp_start) + parseInt(request_timeout.toString())
        if (now > expires_in) {
          await parseRequest(deal_proposal_index)
        } else {
          console.log('[REQUESTS] --> Deal proposal expired')
          await db.update('requests', { index: deal_proposal_index }, { $set: { expired: true } })
        }
      } else if (checkDB.canceled === true) {
        console.log('[REQUESTS] --> Deal proposal canceled')
        await db.update('requests', { index: deal_proposal_index }, { $set: { canceled: true } })
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
  instance.contract.on("DealProposalCreated", async (data_uri, deal_proposal_id, event) => {
    if (!isParsingRequests) {
      console.log("[EVENT] Deal proposal created")
      const deal_proposal_index = parseInt(deal_proposal_id.toString())
      parseRequest(deal_proposal_index, event.transactionHash)
    }
  })
  instance.contract.on("DealAccepted", async (deal_proposal_id, event) => {
    if (!isParsingRequests) {
      console.log("[EVENT] Deal proposal accepted")
      const deal_proposal_index = parseInt(deal_proposal_id.toString())
      updateRequest(deal_proposal_index, '', event.transactionHash)
    }
  })
  // instance.contract.on("DealProposalCanceled", async (deal_proposal_id, event) => {
  //   if (!isParsingRequests) {
  //     console.log("[EVENT] Deal proposal canceled")
  //     const deal_proposal_index = parseInt(deal_proposal_id.toString())
  //     updateRequest(deal_proposal_index, '', '', event.transactionHash)
  //   }
  // })
}