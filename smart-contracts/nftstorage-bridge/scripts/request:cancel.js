const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up dealers's wallet
    const wallet = new ethers.Wallet.fromMnemonic(configs.owner_mnemonic, "m/44'/60'/0'/0/1").connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const bridge_id = 4

    try {
        console.log("Cancel bridge request:", bridge_id)
        const tx = await contract.cancelBridge(bridge_id)
        console.log('Pending transaction at: ' + tx.hash)
        await tx.wait()
        console.log("Request created successfully at", tx.hash)
    } catch (e) {
        console.log(e)
        console.log('Can\'t cancel request, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
