const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up dealers's wallet
    const dealer = new ethers.Wallet.fromMnemonic(configs.owner_mnemonic, "m/44'/60'/0'/0/3").connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, dealer)

    const bridge_id = 1

    try {
        console.log("Accepting bridge:", bridge_id)
        const tx = await contract.acceptBridge(bridge_id)
        console.log('Pending transaction at: ' + tx.hash)
        const receipt = await tx.wait()
        console.log("Request created successfully at", tx.hash)
        console.log("💸 Gas used:", receipt.gasUsed.toString())
        const stored = await contract.bridges(bridge_id)
        console.log(stored)
    } catch (e) {
        console.log(e)
        console.log('Can\'t accept request, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
