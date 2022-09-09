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

    const tokenId = 1
    const oracles = [oracle.address]

    try {
        console.log("Create bridge request for token id:", tokenId)
        const tx = await contract.create721Bridge(configs.nft_contract_address, tokenId, oracles)
        console.log('Pending transaction at: ' + tx.hash)
        const receipt = await tx.wait()
        console.log("Request created successfully at", tx.hash)
        console.log("💸 Gas used:", receipt.gasUsed.toString())
        console.log("Bridge ID is:", receipt.events[0].args.bridge_id.toString())
        const stored = await contract.bridges(receipt.events[0].args.bridge_id)
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
