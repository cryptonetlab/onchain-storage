# Web3.Storage Bounty Protocol

Web3.storage offers the possibility of storing a file on Filecoin and IPFS by simply uploading it to the website interface.

Nevertheless, we want to consider here the scenario where a client of another Blockchain Network (the host chain) want to use Web3.Storage as a channel to store a generic file on Filecoin/IPFS directly from the host chain.

Note that here we are considering any kind of files.

Read the complete protocol description here: https://hackmd.io/jBMffp3tRf6DU1f_D09VDQ

## Architecture

Protocol is divided into 3 pieces:

- `node`: Which is the "server" side of the protocol, listens for requests on the blockchain, downloads the file locally using IPFS and upload it on Web3.Storage
- `smart-contract`: Which contains the Solidity code of the on-chain implementation of the protocol
- `ui`: Which contains the interface live at https://web3bounty.app
