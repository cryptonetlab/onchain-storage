const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./libs/Simple721NFT.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Setting up customer's wallet
    const wallet = new ethers.Wallet.fromMnemonic(configs.owner_mnemonic, "m/44'/60'/0'/0/1").connect(provider)
    const contract = new ethers.Contract(configs.nft_721_contract, ABI.abi, wallet)

    const tokenId = 2
    const to = "0xE6c30AD5AeE7AD22e9F39D51d67667587cdD05A1"
    try {
        console.log("Transferring NFT..")
        const tx = await contract.transferFrom(wallet.address, to, tokenId)
        console.log('Pending transaction at: ' + tx.hash)
        const receipt = await tx.wait()
        console.log("NFT created successfully at", tx.hash)
        console.log(receipt)
    } catch (e) {
        console.log(e)
        console.log('Can\'t transfer nft, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
