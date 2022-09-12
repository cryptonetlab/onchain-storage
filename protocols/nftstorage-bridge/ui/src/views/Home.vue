<template>
  <div>
    <h1 class="title is-1">NFT.storage Bridge</h1>
    <div v-if="account">
      Now using {{ account }} address,<br />these are your NFTs on Goerli
      testnet:<br /><br />
      <div v-if="tokens.length > 0">
        <b-field
          style="padding: 0 25%"
          expanded
          label="Select an NFT to start the bridge request"
        >
          <b-select v-model="token" expanded placeholder="Select an NFT">
            <option
              v-for="option in tokens"
              :value="
                option.tokenType +
                '-' +
                option.contract.address +
                '-' +
                option.tokenId
              "
              :key="option.tokenId"
            >
              {{ option.tokenType }} - {{ option.contract.address }} -
              {{ option.tokenId }}
            </option>
          </b-select>
        </b-field>
        <div v-if="token">
          <b-button
            type="is-primary"
            v-if="contractAddress && !isWorking"
            v-on:click="bridge"
            >START BRIDGE REQUEST</b-button
          >
        </div>
        <div v-if="isWorking">{{ workingMessage }}</div>
      </div>
      <div v-if="tokens.length === 0">You don't have any nft.</div>
    </div>
    <div v-if="!account">
      Please connect your Metamask wallet first,<br />window should be open
      automatically or click below button.<br /><br />
      <b-button type="is-primary" v-on:click="connect"
        >CONNECT METAMASK</b-button
      >
    </div>
  </div>
</template>

<script>
const axios = require("axios");
var Web3 = require("web3");
import { Network, Alchemy } from "alchemy-sdk";

export default {
  name: "Home",
  data() {
    return {
      web3: new Web3(window.ethereum),
      axios: axios,
      contractAddress: "",
      account: "",
      isWorking: false,
      workingMessage: "",
      tokens: [],
      token: "",
    };
  },
  watch: {
    fileToMint() {
      this.uploadFile();
    },
  },
  methods: {
    async connect() {
      const app = this;
      window.ethereum.enable();
      const cached = localStorage.getItem("eth_contract");
      console.log(cached);
      if (cached !== null) {
        app.contractAddress = cached;
      }

      try {
        let accounts = await this.web3.eth.getAccounts();
        const netId = await app.web3.eth.net.getId();
        console.log("Network:", netId);
        if (netId == 5) {
          app.account = accounts[0];
          const alchemy = new Alchemy({
            apiKey: process.env.VUE_APP_ALCHEMY_KEY,
            network: Network.ETH_GOERLI,
          });
          const nfts = await alchemy.nft.getNftsForOwner(app.account);
          app.tokens = nfts.ownedNfts;
          console.log("Found tokens:", nfts.ownedNfts);
        } else {
          alert("Please switch to Goerli testnet!");
        }
      } catch (e) {
        alert(e.message);
      }
    },
    async bridge() {
      const app = this;
      if (app.token !== "") {
        console.log("Token", app.token);
        const contract = await new this.web3.eth.Contract(
          [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_contract",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_token_id",
                  type: "uint256",
                },
              ],
              name: "create721Bridge",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_contract",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_token_id",
                  type: "uint256",
                },
              ],
              name: "create1155Bridge",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          process.env.VUE_APP_CONTRACT_ADDRESS,
          {
            gasLimit: "5000000",
          }
        );
        app.isWorking = true;
        app.workingMessage = "Please confirm action in Metamask...";
        try {
          const tokenId = app.token.split("-")[2];
          const contractAddress = app.token.split("-")[1];
          if (app.token.indexOf("ERC721") !== -1) {
            await contract.methods
              .create721Bridge(contractAddress, tokenId)
              .send({ from: app.account })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending tx at: " + tx;
              });
          } else {
            await contract.methods
              .create1155Bridge(contractAddress, tokenId)
              .send({ from: app.account })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending tx at: " + tx;
                window.open("https://goerli.etherscan.io/tx/" + tx, "_blank");
              });
          }
          alert("Bridge request created correctly!");
          app.isWorking = false;
          app.token = "";
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
        }
      }
    },
  },
};
</script>