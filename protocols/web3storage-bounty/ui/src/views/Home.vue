<template>
  <div>
    <img src="../assets/logo.svg" style="height: 130px" /><br /><br />
    <h1 class="title is-1">Web3 Bounty</h1>
    <h3 class="title is-3" style="margin-top: -20px">web3.storage dealer</h3>
    <!-- Blockchain contract -->
    <div class="network-container">
      <div
        class="is-flex is-align-items-center is-justify-content-space-between"
      >
        <img
          class="mr-3"
          width="30"
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          alt=""
        />
        <p>
          <b>
            <span v-if="parseInt(network) === 5">Goerli</span>
            <span v-if="parseInt(network) === 137">Polygon</span
            ><span v-if="parseInt(network) === 1">Ethereum</span>
            <span v-if="network === 11155111">Sepolia</span></b
          >
        </p>
        <i
          class="mdi mdi-checkbox-blank-circle ml-3 mr-3"
          :class="{
            'secondary-color': account,
            'error-color': !account,
          }"
        ></i>
      </div>
    </div>
    <!-- END |  Blockchain contract -->
    <div v-if="contractsFound">
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
                  props.row.data_uri.replace(
                    'ipfs://',
                    'https://w3-b.link/ipfs/'
                  )
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
            <b-table-column field="canceled" label="Pins" v-slot="props">
              <div v-if="props.row.pins !== undefined">
                <a
                  href="#"
                  @click="
                    showModal = true;
                    dealDetails = props.row.pins;
                  "
                  >{{ props.row.pins.length }}</a
                >
              </div>
              <div v-if="props.row.pins === undefined">N/A</div>
            </b-table-column>
            <b-table-column field="expired" label="Deals" v-slot="props">
              <div v-if="props.row.deals !== undefined">
                <a
                  href="#"
                  @click="
                    showModal = true;
                    dealDetails = props.row.deals;
                  "
                  >{{ props.row.deals.length }}</a
                >
              </div>
              <div v-if="props.row.deals === undefined">N/A</div>
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
        <b-modal
          v-model="showModal"
          has-modal-card
          trap-focus
          :destroy-on-hide="false"
          aria-role="dialog"
          aria-label="Example Modal"
          close-button-aria-label="Close"
          aria-modal
        >
          <template>
            <div class="modal-card" style="width: 600px">
              <header class="modal-card-head">
                <p class="modal-card-title">Web3.Storage details</p>
                <button
                  type="button"
                  class="delete"
                  @click="showModal = false"
                />
              </header>
              <section class="modal-card-body">
                <pre
                  v-if="dealDetails.length > 0"
                  style="text-align: left; font-size: 13px"
                  >{{ dealDetails }}</pre
                >
                <div v-if="dealDetails.length === 0" style="color: #000">
                  Nothing to show.
                </div>
              </section>
            </div>
          </template>
        </b-modal>
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

    <!-- NO CONTRACT FOUND. CHANGE NETWORK -->
    <div class="column has-text-centered" v-if="!contractsFound">
      <div class="mt-6 mb-6">
        <h2>No contracts in this network, <br />please switch to:</h2>
      </div>
      <div class="is-flex is-align-items-center is-justify-content-center">
        <b-button
          style="min-width: 180px; text-transform: uppercase"
          class="is-info mr-3"
          @click="selectContract(network)"
          v-for="(network, index) in networks"
          :key="index"
        >
          <span> {{ network }}</span>
        </b-button>
      </div>
    </div>
    <!-- END NO CONTRACT FOUND. CHANGE NETWORK -->
  </div>
</template>

<script>
const axios = require("axios");
const ABI = require("../../abi.json");
const CONFIG = require("../../config.json");

import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default {
  name: "Home",
  data() {
    return {
      config: CONFIG,
      web3: new Web3(window.ethereum),
      ipfsURL: process.env.VUE_APP_CACHE_NODE + "/upload",
      abi: ABI,
      apiEndpoint: "",
      contract: "",
      networks: [],
      network: 137,
      contractsFound: false,
      selectedContract: "",
      fileToUpload: {},
      dealUri: "",
      axios: axios,
      contractAddress: "",
      account: "",
      showModal: false,
      showDeals: false,
      isWorking: false,
      accepted: false,
      workingMessage: "",
      uploadPercentage: 0,
      confirmed: "",
      deals: [],
      dealDetails: [],
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
      this.fetchingContract();
    }
    const app = this;
    app.connect();
    if (localStorage.getItem("contract") === null) {
      localStorage.setItem("contract", "polygon");
    }
    if (window.ethereum !== undefined) {
      window.ethereum.on("chainChanged", function (accounts) {
        if (app.$route.name === "Home") {
          // app.connect();
        }
      });
    }
    app.fetchAvailableNetowrk();
  },
  methods: {
    // Connection and switch networks/blockchain
    fetchAvailableNetowrk() {
      const app = this;
      let temp = [];
      for (let i in app.config) {
        temp.push(app.config[i].blockchain);
      }
      app.networks = temp.filter((c, index) => {
        return temp.indexOf(c) === index;
      });
    },
    async fetchingContract() {
      return new Promise((response) => {
        const app = this;
        // Fetching data by contract selected
        app.selectedContract = localStorage.getItem("contract");
        console.log("CONTRACT Selected is:", app.selectedContract);
        if (app.selectedContract === "polygon") {
          app.contract = app.config[0].contract;
          app.network = app.config[0].network;
          app.apiEndpoint = app.config[0].api;
          app.abi = ABI;
        } else if (app.selectedContract === "goerli") {
          app.contract = app.config[1].contract;
          app.network = app.config[1].network;
          app.apiEndpoint = app.config[1].api;
          app.abi = ABI;
        } else if (app.selectedContract === null) {
          app.contract = app.config[0].contract;
          app.network = app.config[0].network;
          app.apiEndpoint = app.config[0].api;
          app.abi = ABI;
          localStorage.setItem("contract", "polygon");
        }
        console.log(
          "contract spec",
          "address",
          app.contract,
          "network",
          app.network,
          "endpoint",
          app.apiEndpoint
        );
        response(true);
      });
    },
    async connect() {
      const app = this;
      let providerOptions = {};
      if (app.infuraId !== undefined) {
        providerOptions = {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: app.infuraId,
            },
          },
        };
      }
      // Instantiating Web3Modal
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: providerOptions,
      });

      try {
        const provider = await web3Modal.connect();
        app.web3 = await new Web3(provider);
      } catch (e) {
        console.log("PROVIDER_ERROR", e.message);
      }
      const netId = await app.web3.eth.net.getId();
      console.log("Current network is:", netId);
      app.contractsFound = false;
      app.network = netId;
      // Goerli
      if (parseInt(netId) === 5) {
        app.network = 5;
        localStorage.setItem("contract", "goerli");
        app.contractsFound = true;
        await app.fetchingContract();
      } else if (parseInt(netId) === 137) {
        app.network = 137;
        localStorage.setItem("contract", "polygon");
        app.contractsFound = true;
        await app.fetchingContract();
      }

      if (app.contractsFound) {
        try {
          const accounts = await app.web3.eth.getAccounts();
          if (accounts.length > 0) {
            app.account = accounts[0];
            app.appealAddress = app.account;
            app.accountBalance = await app.web3.eth.getBalance(accounts[0]);
            app.accountBalance = parseFloat(
              app.web3.utils.fromWei(app.accountBalance, "ether")
            ).toFixed(10);
            await app.fetchDeals();
          }
        } catch (e) {
          console.log("USER_CONNECT", e.message);
        }
      }
    },
    async selectContract(network) {
      const app = this;
      console.log("NETWORK IS:", network);
      const netId = await app.web3.eth.net.getId();
      let networkSelected;
      if (network === "polygon") {
        app.selectedContract = localStorage.setItem("contract", "polygon");
        networkSelected = 137;
        console.log("network selected", networkSelected);
      } else if (network === "goerli") {
        app.selectedContract = localStorage.setItem("contract", "goerli");
        networkSelected = 5;
        console.log("network selected", networkSelected);
      }
      if (parseInt(netId) !== parseInt(networkSelected)) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0x" + Number(networkSelected).toString(16),
              },
            ],
          });
          setTimeout(function () {
            app.connect();
          }, 100);
        } catch (e) {
          // ADD POLYGON MAINNET IF NOT FOUND
          if (
            e.message ===
            'Unrecognized chain ID "0x89". Try adding the chain using wallet_addEthereumChain first.'
          ) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x" + Number(networkSelected).toString(16),
                    blockExplorerUrls: ["https://polygonscan.com/"],
                    chainName: "Polygon Mainnet",
                    nativeCurrency: {
                      decimals: 18,
                      name: "Polygon",
                      symbol: "MATIC",
                    },
                    rpcUrls: ["https://polygon-rpc.com"],
                  },
                ],
              });
              setTimeout(function () {
                app.connect();
              }, 100);
            } catch (e) {
              app.alertCustomError(
                "Can't add Polygon network, please do it manually."
              );
            }
          } else {
            app.alertCustomError(
              "Can't switch network, please do it manually."
            );
          }
        }
      }
    },
    // END ---  Connection and switch networks/blockchain
    async uploadFile() {
      const app = this;
      app.isWorking = true;
      const formData = new FormData();
      formData.append("file", app.fileToUpload);
      formData.append("name", app.fileToUpload.name);
      formData.append("address", app.account);
      app.workingMessage = "Uploading file to IPFS...<br>0%";
      axios({
        method: "post",
        url: app.ipfsURL,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          app.uploadPercentage = (
            (progressEvent.loaded / app.fileToUpload.size) *
            100
          ).toFixed(2);
          if (parseFloat(app.uploadPercentage) < 100) {
            app.workingMessage =
              "Uploading file to IPFS...<br>" + app.uploadPercentage + "%";
          } else {
            app.workingMessage =
              "Upload complete!";
          }
        },
      }).then(function (response) {
        app.isWorking = false;
        if (response.data.cid !== undefined) {
          app.dealUri = "ipfs://" + response.data.cid;
        } else {
          alert("There was an error while uploading file!");
          app.fileToUpload = "";
        }
      });
    },

    async createDealProposal() {
      const app = this;
      if (app.dealUri !== "") {
        console.log("Files URI", app.dealUri);
        const gasPrice = await app.web3.eth.getGasPrice();
        const contract = await new app.web3.eth.Contract(
          app.abi,
          app.contract,
          {
            gasLimit: "300000",
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
        app.apiEndpoint + "/deals/" + app.account
      );
      const api_deals = await axios.get(
        app.apiEndpoint + "/deals/" + app.account
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
      const contract = await new this.web3.eth.Contract(app.abi, app.contract, {
        gasLimit: "5000000",
      });
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
