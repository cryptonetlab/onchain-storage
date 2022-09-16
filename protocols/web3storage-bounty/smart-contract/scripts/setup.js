const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up dealers's wallet
    const wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    for (let k in configs.dealers) {
        const dealer = configs.dealers[k]
        try {
            console.log("Adding dealer to contract:", dealer.address)
            const tx = await contract.setDealerStatus(dealer.address, true)
            console.log('Pending transaction at: ' + tx.hash)
            await tx.wait()
            console.log("Request created successfully at", tx.hash)
        } catch (e) {
            console.log(e)
            console.log('Can\'t create deal, check transaction.')
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
