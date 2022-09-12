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

    const tokenURI = "bafkreib4c57ebfi2ttwtkh4da7d5woatdhvxhmm5gz4jqvpih2yt6f65na"
    try {
        console.log("Minting NFT in contract..")
        const tx = await contract.mint(tokenURI)
        console.log('Pending transaction at: ' + tx.hash)
        const receipt = await tx.wait()
        console.log("NFT created successfully at", tx.hash)
        console.log(receipt)
    } catch (e) {
        console.log(e)
        console.log('Can\'t mint new nft, check transaction.')
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
