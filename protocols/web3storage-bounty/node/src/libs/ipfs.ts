import axios from "axios"
import FormData from "form-data"
import { Web3Storage } from 'web3.storage'
import * as Database from "./database";

const getWeb3Nodes = async () => {
    const req = await axios.get("https://raw.githubusercontent.com/web3-storage/web3.storage/main/PEERS")
    let nodes = <any>[]
    const parsed = req.data.split('\n')
    for (let k in parsed) {
        if (parsed[k].indexOf('#') === -1 && parsed[k].length > 0) {
            nodes.push(parsed[k])
        }
    }
    return nodes
}

const ipfs = (method, endpoint, arg?) => {
    return new Promise(async response => {
        let timeout
        try {
            timeout = setTimeout(function () {
                console.log('IPFS timed out..')
                if (arg !== undefined) {
                    console.log(method, endpoint, arg)
                } else {
                    console.log(method, endpoint)
                }
                console.log('--')
                response(false)
            }, 60000)
            let request = {
                "method": method,
                "url": "http://localhost:5001/api/v0" + endpoint,
                "data": undefined
            }
            if (arg !== undefined) {
                request.data = arg
            }
            const res = await axios(request)
            console.log('IPFS response arrived')
            if (arg !== undefined) {
                console.log(method, endpoint, arg)
            } else {
                console.log(method, endpoint)
            }
            console.log(res.data)
            console.log('--')
            clearTimeout(timeout)
            response(res.data)
        } catch (e) {
            clearTimeout(timeout)
            response(false)
        }
    })
}

const add = (buffer, filename, onlyHash = false) => {
    return new Promise(async (response) => {
        try {
            console.log('[IPFS] Uploading on local node...')
            const formData = new FormData();
            formData.append("file", buffer, { filename });
            const added = await axios({
                method: "post",
                url: "http://localhost:5001/api/v0/add?cid-version=1&only-hash=" + onlyHash,
                data: formData,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": "multipart/form-data;boundary=" + formData.getBoundary(),
                },
            })
            console.log("[IPFS] Local node response")
            console.log(added.data)
            console.log("---")
            response(added.data.Hash.toString())
        } catch (e) {
            console.log("[IPFS] Upload error", e.message)
            response(false);
        }
    });
};

function listUploads() {
    return new Promise(async response => {
        if (process.env.WEB3_STORAGE_KEY !== undefined) {
            let files = <any>[]
            try {
                const client = new Web3Storage({ token: process.env.WEB3_STORAGE_KEY })
                for await (const upload of client.list()) {
                    files.push(upload)
                }
                response(files)
            } catch (e) {
                console.log("Failed to fetch the list of deals")
                response(false)
            }
        } else {
            response(false)
        }
    })
}

const parseCache = async () => {
    try {
        console.log('[CACHE] Starting parse cache process...')
        const files = <any>await listUploads()
        if (files !== false) {
            const db = new Database.default.Mongo()
            for (let k in files) {
                try {
                    if (files[k].pins.length > 0) {
                        const checkCar = await db.find('cache', { car: files[k].cid })
                        if (checkCar === null) {
                            console.log("Getting info from CAR: " + files[k].cid)
                            const content = await axios.get("https://dweb.link/api/v0/ls?arg=" + files[k].cid)
                            const cid = content.data.Objects[0].Links[0].Hash
                            console.log("-> Original content inside CAR is:", cid)
                            // Removing original content from local node
                            const checkDB = await db.find('cache', { cid: cid, expired: false })
                            if (checkDB !== null) {
                                console.log("--> Removing pin from local node..")
                                await ipfs("post", "/pin/rm?arg=" + cid + '&recursive=true')
                                await db.update('cache', { cid: cid, expired: false }, { $set: { expired: true, pins: files[k].pins, car: files[k].cid } })
                            } else {
                                console.log("--> Can't find CID on local node..")
                                await db.insert('cache', { pins: files[k].pins, car: files[k].cid })
                            }
                            // Adding CAR and pins to original request
                            const deal_index = parseInt(content.data.Objects[0].Links[0].Name.split("_DEAL_")[1].split(".")[0])
                            await db.update('requests', { index: deal_index }, { $set: { pins: files[k].pins, car: files[k].cid, deals: files[k].deals } })
                        } else {
                            console.log("-> Already processed CAR: " + files[k].cid)
                        }
                    }
                    if (files[k].deals.length > 0) {
                        const checkDeals = await db.find('requests', { car: files[k].cid })
                        if (checkDeals !== null && checkDeals.deals.length === 0) {
                            console.log("Getting info from CAR: " + files[k].cid)
                            const content = await axios.get("https://dweb.link/api/v0/ls?arg=" + files[k].cid)
                            const deal_index = parseInt(content.data.Objects[0].Links[0].Name.split("_DEAL_")[1].split(".")[0])
                            console.log("-> Deal index is:", deal_index)
                            const checkDB = await db.find('requests', { index: deal_index })
                            if (checkDB !== null) {
                                console.log("--> Adding Filecoin's deal informations..")
                                await db.update('requests', { index: deal_index }, { $set: { deals: files[k].deals, car: files[k].cid } })
                            } else {
                                console.log("--> Can't find deal..")
                            }
                        } else {
                            console.log("-> Deal already processed.")
                        }
                    }
                    console.log("--")
                } catch (e) {
                    console.log("Can't get info for: " + files[k].cid)
                }
            }
            console.log("[CACHE] Process cache ended, will start again in 60s...")
        } else {
            console.log("[CACHE] Process cache can't start, will start again in 60s...")
        }
        setTimeout(function () {
            parseCache()
        }, 60000)
    } catch (e) {
        console.log("Parsing cache failed..")
        console.log(e.message)
        setTimeout(function () {
            parseCache()
        }, 60000)
    }
};

const indexFiles = async () => {
    try {
        console.log('[INDEX] Starting index process...')
        const db = new Database.default.Mongo()
        const requests = await db.find("requests", { indexed: { $ne: true } }, { timestamp_request: 1 })
        console.log("Found " + requests.length + " to index..")
        for (let k in requests) {
            try {
                console.log("[INDEX] Asking to index deal #", requests[k].index)
                const indexed = await axios.get(process.env.ONCHAIN_API + "/index/" + process.env.PROTOCOL_ID + "/" + requests[k].index)
                console.log("[INDEX] Onchain response is:", indexed.data)
                if (indexed.data.error !== undefined && indexed.data.error === false) {
                    await db.update("requests", { _id: requests[k]._id }, { $set: { indexed: true } })
                }
            } catch (e) {
                console.log("[INDEX] Onchain API errored..")
            }
        }
        console.log("[INDEX] Process index ended, will start again in 60s...")
        setTimeout(function () {
            indexFiles()
        }, 60000)
    } catch (e) {
        console.log("Process index failed..")
        console.log(e.message)
        setTimeout(function () {
            indexFiles()
        }, 60000)
    }
};

export { ipfs, getWeb3Nodes, add, parseCache, indexFiles }