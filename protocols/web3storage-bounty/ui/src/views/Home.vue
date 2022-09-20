<template>
  <div>
    <img src="../assets/logo.svg" style="height: 130px" /><br /><br />
    <h1 class="title is-1">Onchain.Storage X Web3.Storage</h1>
    <br />
    <div v-if="account && confirmed.length === 0">
      <div v-if="isWorking" v-html="workingMessage"></div>
      <div v-if="dealUri && !isWorking">
        Your file is ready here<br />{{ dealUri }}<br />Please create now the
        storage request.
      </div>
      <b-field v-if="!fileToUpload.name" style="padding: 0 20%">
        <b-upload v-model="fileToUpload" expanded drag-drop>
          <section class="section">
            <div class="content has-text-centered">
              <p>Drop your files here or click to upload</p>
            </div>
          </section>
        </b-upload>
      </b-field>
      <br />
      <b-button
        type="is-primary"
        :disabled="!dealUri || isWorking"
        v-on:click="createDealProposal"
        >CREATE STORAGE REQUEST</b-button
      >
    </div>
    <div v-if="confirmed.length > 0">
      Hurray! You're soon able to reach your content at:<br />
      <a :href="'https://w3s.link/ipfs/' + confirmed" target="_blank">{{
        "https://w3s.link/ipfs/" + confirmed
      }}</a
      ><br /><br />
      <b-button type="is-primary" v-on:click="confirmed = ''">RESTART</b-button>
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

export default {
  name: "Home",
  data() {
    return {
      web3: new Web3(window.ethereum),
      ipfsURL: "https://api.umi.tools/ipfs/upload",
      fileToUpload: {},
      dealUri: "",
      axios: axios,
      contractAddress: "",
      account: "",
      isWorking: false,
      workingMessage: "",
      confirmed: "",
    };
  },
  watch: {
    fileToUpload() {
      if (this.fileToUpload.name !== undefined) {
        this.uploadFile();
      }
    },
  },
  methods: {
    async connect() {
      const app = this;
      window.ethereum.enable();
      try {
        let accounts = await this.web3.eth.getAccounts();
        const netId = await app.web3.eth.net.getId();
        console.log("Network:", netId);
        // Search for Goerli testnet
        if (netId == 5) {
          app.account = accounts[0];
        } else {
          alert("Please switch to Goerli testnet!");
        }
      } catch (e) {
        alert(e.message);
      }
    },
    async uploadFile() {
      const app = this;
      app.isWorking = true;
      const formData = new FormData();
      formData.append("file", app.fileToUpload);
      formData.append("name", app.fileToUpload.name);
      app.workingMessage = "Uploading file to IPFS...";
      axios({
        method: "post",
        url: app.ipfsURL,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(function (response) {
        app.dealUri = "ipfs://" + response.data.ipfs_hash;
        app.isWorking = false;
      });
    },
    async createDealProposal() {
      const app = this;
      if (app.dealUri !== "") {
        console.log("Files URI", app.dealUri);
        const contract = await new this.web3.eth.Contract(
          [
            {
              inputs: [
                {
                  internalType: "string",
                  name: "_data_uri",
                  type: "string",
                },
                {
                  internalType: "address[]",
                  name: "_dealers",
                  type: "address[]",
                },
                {
                  internalType: "address[]",
                  name: "_oracle_addresses",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "_duration",
                  type: "uint256",
                },
              ],
              name: "createDealProposal",
              outputs: [],
              stateMutability: "payable",
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
          const dealers = [];
          const oracles = [];
          const duration = 60 * 60 * 24 * 365;
          await contract.methods
            .createDealProposal(app.dealUri, dealers, oracles, duration)
            .send({ from: app.account })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending tx at:<br>" + tx;
            });
          alert("Storage request created correctly!");
          app.confirmed = app.dealUri.replace("ipfs://", "");
          app.isWorking = false;
          app.dealUri = "";
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
        }
      }
    },
  },
};
</script>