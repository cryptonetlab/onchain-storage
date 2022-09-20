import axios from "axios"

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
        try {
            setTimeout(function () {
                console.log('IPFS timed out..')
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
            response(res.data)
        } catch (e) {
            response(false)
        }
    })
}

export { ipfs, getWeb3Nodes }