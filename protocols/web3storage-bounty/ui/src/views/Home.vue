<template>
  <div>
    <h1 class="title is-1">Onchain.Storage X Web3.Storage</h1>
    <div v-if="account">
      <div v-if="isWorking">{{ workingMessage }}</div>
      <div v-if="filesUri && !isWorking">
        Your file is ready here {{ filesUri }}<br />Please create now the
        storage request..
      </div>
      <b-field v-if="!fileToUpload.name">
        <b-upload v-model="fileToUpload" expanded drag-drop>
          <section class="section">
            <div class="content has-text-centered">
              <p>Drop your files here or click to upload</p>
            </div>
          </section>
        </b-upload>
      </b-field>
      <br>
      <b-button
        type="is-primary"
        :disabled="!filesUri || isWorking"
        v-on:click="startRequest"
        >CREATE STORAGE REQUEST</b-button
      >
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
      filesUri: "",
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
    fileToUpload() {
      this.uploadFile();
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
      if (app.fileToUpload.name && !app.isWorking) {
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
          app.filesUri = "ipfs://" + response.data.ipfs_hash;
          app.isWorking = false;
        });
      } else {
        alert("Select a file first!");
      }
    },
    async startRequest() {
      const app = this;
      if (app.filesUri !== "") {
        console.log("Files URI", app.filesUri);
        const contract = await new this.web3.eth.Contract(
          [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_data_uri",
                  type: "string",
                },
              ],
              name: "createStorageRequest",
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
          await contract.methods
            .createStorageRequest(app.filesUri)
            .send({ from: app.account })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending tx at: " + tx;
            });
          alert("Storage request created correctly!");
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