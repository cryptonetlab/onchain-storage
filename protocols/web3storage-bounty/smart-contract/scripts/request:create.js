const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up dealers's wallet
    const oracle = new ethers.Wallet.fromMnemonic(configs.owner_mnemonic, "m/44'/60'/0'/0/2").connect(provider)
    const wallet = new ethers.Wallet.fromMnemonic(configs.owner_mnemonic, "m/44'/60'/0'/0/1").connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const data_uri = "ipfs://bafybeihkk2qcpletzahbuxeen6eiyitmlx25a6u7e5ho4akt7tssdvwp6u"
    const dealers = []
    const oracles = []
    const duration = 60 * 60 * 24 * 365

    try {
        console.log("Create deal proposal for uri:", data_uri)
        const tx = await contract.createDealProposal(data_uri, dealers, oracles, duration)
        console.log('Pending transaction at: ' + tx.hash)
        const receipt = await tx.wait()
        console.log("Request created successfully at", tx.hash)
        console.log("💸 Gas used:", receipt.gasUsed.toString())
        console.log("Bridge ID is:", receipt.events[0].args.deal_id.toString())
        const stored = await contract.deals(receipt.events[0].args.deal_id)
        console.log(stored)
    } catch (e) {
        console.log(e)
        console.log('Can\'t create request, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
