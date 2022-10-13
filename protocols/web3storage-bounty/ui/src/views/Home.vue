<template>
  <div>
    <img src="../assets/logo.svg" style="height: 130px" /><br /><br />
    <h1 class="title is-1">Web3 Bounty</h1>
    <h3 class="title is-3" style="margin-top: -20px">web3.storage dealer</h3>
    <div v-if="confirmed.length === 0">
      <div v-if="!showDeals">
        <a @click="showDeals = true" v-if="account">SHOW DEALS</a><br /><br />
        <div v-if="dealUri && !isWorking">
          Data URI is:<br />{{ dealUri }}<br />
          It will be used to create the storage request.
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
          v-if="!account && !isWorking"
          v-on:click="connect"
          >CONNECT METAMASK</b-button
        >
        <b-button
          type="is-primary"
          v-if="!isWorking && account"
          :disabled="!dealUri"
          v-on:click="createDealProposal"
        >
          CREATE DEAL PROPOSAL</b-button
        >
      </div>
      <div v-if="showDeals" style="padding: 0 15%">
        <a @click="showDeals = false">NEW DEAL</a><br /><br />
        <b-table v-if="deals.length > 0" :data="deals">
          <b-table-column field="index" label="Index" v-slot="props">
            {{ props.row.index }}
          </b-table-column>
          <b-table-column field="data_uri" label="Data URI" v-slot="props">
            <a
              :href="
                '' +
                props.row.data_uri.replace('ipfs://', 'https://w3-b.link/ipfs/')
              "
              target="_blank"
              >{{ props.row.data_uri }}</a
            >
          </b-table-column>
          <b-table-column
            field="timestamp_request"
            label="Timestamp Request"
            v-slot="props"
          >
            {{ props.row.timestamp_request }}
          </b-table-column>
          <b-table-column
            field="timestamp_start"
            label="Timestamp Start"
            v-slot="props"
          >
            {{ props.row.timestamp_start }}
          </b-table-column>
          <b-table-column field="canceled" label="Canceled" v-slot="props">
            {{ props.row.canceled }}
          </b-table-column>
          <b-table-column field="expired" label="Expired" v-slot="props">
            {{ props.row.expired }}
          </b-table-column>
          <b-table-column label="Cancel" v-slot="props">
            <b-button
              v-if="
                props.row.timestamp_start === 'NOT STARTED' &&
                !props.row.canceled
              "
              type="is-primary is-small"
              style="font-size: 14px !important"
              v-on:click="cancelDealProposal(props.row.index)"
              >CANCEL</b-button
            >
            <span
              v-if="
                props.row.timestamp_start !== 'NOT STARTED' ||
                props.row.canceled
              "
              >-</span
            >
          </b-table-column>
        </b-table>
        <div v-if="deals.length === 0">DON'T HAVE DEALS!</div>
      </div>
      <br />
      <div v-if="isWorking" v-html="workingMessage"></div>
    </div>
    <div v-if="confirmed.length > 0">
      Hurray! Your content is ready to be shared at:<br />
      <a :href="'https://w3-b.link/ipfs/' + confirmed" target="_blank">{{
        "https://w3-b.link/ipfs/" + confirmed
      }}</a
      ><br /><br />
      <div v-if="!accepted">Waiting for web3.storage confirmation...</div>
      <div v-if="accepted">
        Confirmation arrived, your file is now stored on web3.storage!
      </div>
      <br />
      <b-button
        type="is-primary"
        v-on:click="
          fetchDeals();
          confirmed = '';
          accepted = false;
        "
        >RESTART</b-button
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
      ipfsURL: process.env.VUE_APP_CACHE_NODE + "/upload",
      fileToUpload: {},
      dealUri: "",
      axios: axios,
      contractAddress: "",
      account: "",
      showDeals: false,
      isWorking: false,
      accepted: false,
      workingMessage: "",
      confirmed: "",
      deals: [],
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_deal_id",
              type: "uint256",
            },
          ],
          name: "cancelDealProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "deals_counter",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
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
          outputs: [
            {
              internalType: "uint256",
              name: "deal_id",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "deal_id",
              type: "uint256",
            },
          ],
          name: "DealAccepted",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "deals",
          outputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "string",
              name: "data_uri",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "duration",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "canceled",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "claimed",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "timestamp_request",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "timestamp_start",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
    };
  },
  watch: {
    fileToUpload() {
      if (this.fileToUpload.name !== undefined) {
        this.uploadFile();
      }
    },
  },
  mounted() {
    if (localStorage.getItem("connected") !== null) {
      this.connect();
    }
  },
  methods: {
    async connect() {
      const app = this;
      window.ethereum.enable();
      try {
        let accounts = await this.web3.eth.getAccounts();
        const netId = await app.web3.eth.net.getId();
        console.log("Network:", netId);
        // Search for Polygon network
        if (netId == 137) {
          app.account = accounts[0];
          app.fetchDeals();
          localStorage.setItem("connected", true);
        } else {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x" + Number(137).toString(16),
                  chainName: "Polygon",
                  rpcUrls: ["https://polygon-rpc.com"],
                  nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://polygonscan.com"],
                },
              ],
            });
            setTimeout(function () {
              app.connect();
            }, 100);
          } catch (e) {
            alert("Please switch to Polygon network!");
          }
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
      formData.append("address", app.account);
      app.workingMessage = "Uploading file to IPFS...";
      axios({
        method: "post",
        url: app.ipfsURL,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(function (response) {
        app.dealUri = "ipfs://" + response.data.cid;
        app.isWorking = false;
      });
    },
    async createDealProposal() {
      const app = this;
      if (app.dealUri !== "") {
        console.log("Files URI", app.dealUri);
        const gasPrice = await app.web3.eth.getGasPrice();
        const contract = await new app.web3.eth.Contract(
          app.abi,
          process.env.VUE_APP_CONTRACT_ADDRESS,
          {
            gasLimit: "5000000",
            gasPrice: gasPrice,
          }
        );
        app.isWorking = true;
        app.workingMessage = "Please confirm action in Metamask...";
        try {
          const dealers = [];
          const oracles = [];
          const duration = 60 * 60 * 24 * 365;
          let last_deal = await contract.methods.deals_counter().call();
          console.log("Last deal is:", last_deal);
          await contract.methods
            .createDealProposal(app.dealUri, dealers, oracles, duration)
            .send({ from: app.account })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending tx at:<br>" + tx;
            });
          const latest = await app.web3.eth.getBlockNumber();
          let polling = setInterval(async function () {
            let events = await contract.getPastEvents(
              "DealAccepted",
              {},
              { fromBlock: latest, toBlock: "latest" }
            );
            events = events.reverse();
            for (let k in events) {
              if (
                parseInt(events[k].returnValues.deal_id) > parseInt(last_deal)
              ) {
                const deal = await contract.methods
                  .deals(events[k].returnValues.deal_id)
                  .call();
                if (
                  deal.owner === app.account &&
                  parseInt(deal.timestamp_start) > 0
                ) {
                  clearTimeout(polling);
                  app.accepted = true;
                }
              }
            }
          }, 2000);
          alert("Storage request created correctly!");
          app.confirmed = app.dealUri.replace("ipfs://", "");
          app.isWorking = false;
          app.fileToUpload = {};
          app.dealUri = "";
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
        }
      }
    },
    async fetchDeals() {
      const app = this;
      app.deals = [];
      console.log(
        "Getting deals from:",
        "https://w3-b.link/deals/" + app.account
      );
      const api_deals = await axios.get(
        "https://w3-b.link/deals/" + app.account
      );
      for (let k in api_deals.data) {
        let deal = api_deals.data[k];
        if (deal.expired === undefined) {
          deal.expired = false;
        }
        if (deal.timestamp_request > 0) {
          deal.timestamp_request = new Date(deal.timestamp_request * 1000)
            .toUTCString()
            .split("GMT")[0];
        } else {
          deal.timestamp_request = "NOT STARTED";
        }
        if (deal.timestamp_start > 0) {
          deal.timestamp_start = new Date(deal.timestamp_start * 1000)
            .toUTCString()
            .split("GMT")[0];
        } else {
          deal.timestamp_start = "NOT STARTED";
        }
        app.deals.push(deal);
      }
    },
    async cancelDealProposal(index) {
      const app = this;
      console.log("Files URI", app.dealUri);
      const contract = await new this.web3.eth.Contract(
        app.abi,
        process.env.VUE_APP_CONTRACT_ADDRESS,
        {
          gasLimit: "5000000",
        }
      );
      app.isWorking = true;
      app.workingMessage = "Please confirm action in Metamask...";
      try {
        await contract.methods
          .cancelDealProposal(index)
          .send({ from: app.account })
          .on("transactionHash", (tx) => {
            app.workingMessage = "Found pending tx at:<br>" + tx;
          });
        alert("Deal proposal canceled correctly!");
        app.isWorking = false;
        setTimeout(function () {
          app.fetchDeals();
        }, 5000);
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
      }
    },
  },
};
</script>
