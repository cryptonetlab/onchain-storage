const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  const nftContract = JSON.parse(fs.readFileSync("./libs/Simple721NFT.json").toString())
  console.log('Deploying contract..')
  const Contract = await hre.ethers.getContractFactory(nftContract.abi, nftContract.bytecode);
  const contract = await Contract.deploy("TestNFT", "TNFT");
  console.log('Deploy transaction is: ' + contract.deployTransaction.hash)
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  configs.nft_721_contract = contract.address
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
