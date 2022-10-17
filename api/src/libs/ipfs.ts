import axios from "axios"

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
      console.log('[IPFS] Response arrived successfully')
      if (process.env.DEBUG !== undefined && process.env.DEBUG === "true") {
        if (arg !== undefined) {
          console.log("[IPFS]", method, endpoint, arg)
        } else {
          console.log("[IPFS]", method, endpoint)
        }
        console.log("[IPFS]", res.data)
        console.log('--')
      }
      clearTimeout(timeout)
      response(res.data)
    } catch (e) {
      console.log("[IPFS] Error while calling:", method, endpoint, arg)
      if (process.env.DEBUG !== undefined && process.env.DEBUG === "true") {
        console.log("[IPFS]", e.response.data.Message)
        console.log("--")
      }
      clearTimeout(timeout)
      response(false)
    }
  })
}

export { ipfs }