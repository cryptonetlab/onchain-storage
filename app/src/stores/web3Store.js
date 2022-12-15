import { defineStore } from "pinia";
////////////////////////////////////////////////////////////
import axios from "axios";
import { ethers } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { connect } from "socket.io-client";

////////////////////////////////////////////////////////////
const CONFIG = require("../config.json");
const RetrievApi = require("../components/retrieval-pinning/api.js");
const Web3BountyApi = require("../components/web3-storage/api.js");

////////////////////////////////////////////////////////////
export const useWeb3Store = defineStore("web3", {
  state: () => ({
    isLoadingState: false,
    loadingUserInfo: false,
    web3: null,
    config: CONFIG,
    network: 137,
    explorer: "https://polygonscan.com/tx/",
    connected: false,
    contractsFound: false,
    account: "",
    networks: [],
    ensAccount: "",
    feeData: "",
    infuraId: process.env.VUE_APP_INFURA_ID,
    selectedContract: "",
    accountBalance: 0,
    protocols: ["Retriev", "Web3Bounty"],
    protocolsApis: { Retriev: RetrievApi, Web3Bounty: Web3BountyApi },
    protocolsContracts: {
      Retriev: "0xc8834A8b64ad66668B11240Dc12B3EE32bA02c5B",
      Web3Bounty: "0x3425534e95f6B5F06c70FBC5f563dd227b7B8CcA",
    },
    protocolEndpoints: {
      Retriev: "",
      Web3Bounty: "",
    },
    providerEndpoints: {
      "Web3.Storage": "web3.storage",
    },
    retrievOpensea: "",
  }),
  actions: {
    // Fetchin information from SC, Network and relatives API endpoints
    async fetchingContract() {
      const app = this;
      let connected = localStorage.getItem("connected");
      if (connected) {
        app.connected = true;
      }
      app.isLoadingState = true;
      // console.log("fetchingContract loading state:", app.isLoadingState);

      // Fetching data by contract selected
      if (localStorage.getItem("contract") === null) {
        localStorage.setItem("contract", "polygon");
      }
      app.selectedContract = localStorage.getItem("contract");
      // console.log("CONTRACT Selected is:", app.selectedContract);

      if (app.selectedContract === "polygon") {
        (app.protocolsContracts = {
          Retriev: app.config[0].contract,
          Web3Bounty: app.config[2].contract,
        }),
          (app.network = 137);
        app.protocolEndpoints = {
          Retriev: app.config[0].api,
          Web3Bounty: app.config[2].api,
        };
        app.retrievOpensea = app.config[2].opensea;
        app.explorer = "https://polygonscan.com/tx/";
      } else if (app.selectedContract === "goerli") {
        (app.protocolsContracts = {
          Retriev: app.config[1].contract,
          Web3Bounty: app.config[3].contract,
        }),
          (app.network = 5);
        app.protocolEndpoints = {
          Retriev: app.config[1].api,
          Web3Bounty: app.config[3].api,
        };
        app.retrievOpensea = app.config[1].opensea;
        app.explorer = "https://goerli.etherscan.io/tx/";
      } else if (app.selectedContract === null) {
        (app.protocolsContracts = {
          Retriev: app.config[0].contract,
          Web3Bounty: app.config[2].contract,
        }),
          (app.network = 137);
        app.protocolEndpoints = {
          Retriev: app.config[0].api,
          Web3Bounty: app.config[2].api,
        };
        app.retrievOpensea = app.config[2].opensea;
        app.explorer = "https://polygonscan.com/tx/";
      }

      // Fetching data from API
      app.fetchEndpoints();
      app.isLoadingState = false;
      // console.log("fetchingEnpoints loading state (end):", app.isLoadingState);
    },
    async fetchEndpoints() {
      const app = this;
      const providers = await axios.get(
        app.protocolEndpoints.Retriev + "/providers"
      );
      for (let k in providers.data) {
        app.providerEndpoints[providers.data[k].address.toLowerCase()] =
          providers.data[k].endpoint;
      }
    },
    fetchNetowrk() {
      const app = this;
      let temp = [];
      for (let i in app.config) {
        temp.push(app.config[i].blockchain);
      }
      app.networks = temp.filter((c, index) => {
        return temp.indexOf(c) === index;
      });
    },
    // End fetching data from API and SC

    //Switch network fucntions (the first is auto and manual the second one)
    async switchNetwork(networkSelected) {
      const app = this;
      app.isLoadingState = true;
      // console.log("switch network loading state:", app.isLoadingState);
      console.log("try switch network");
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
            alert("Can't add Polygon network, please do it manually.");
            app.isLoadingState = false;
            console.log("swhitch error 1 loading state:", app.isLoadingState);
          }
        } else {
          alert("Can't switch network, please do it manually.");
          app.isLoadingState = false;
          console.log("switch error 2 loading state:", app.isLoadingState);
        }
      }
      window.location.reload();
    },
    async switchContract(net) {
      const app = this;
      app.isLoadingState = true;
      // console.log("switchContract loading state (init):", app.isLoadingState);

      console.log("NET IS:", net);
      const netId = await app.web3.eth.net.getId();
      let networkSelected;
      if (net === "polygon") {
        app.selectedContract = localStorage.setItem("contract", "polygon");
        networkSelected = 137;
        console.log(
          "network selected",
          networkSelected,
          localStorage.getItem("contract")
        );
      } else if (net === "goerli") {
        app.selectedContract = localStorage.setItem("contract", "goerli");
        networkSelected = 5;
        console.log(
          "network selected",
          networkSelected,
          localStorage.getItem("contract")
        );
      }
      console.log("NET ID IS", netId);
      if (parseInt(netId) !== parseInt(networkSelected)) {
        console.log("SWITCHING NETWORK");
        app.switchNetwork(networkSelected);
      } else {
        window.location.reload();
      }
    },
    // End switch network

    // Connect wallet functions
    async connect() {
      const app = this;
      app.isLoadingState = true;
      // console.log("connect loading state (init):", app.isLoadingState);
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
        cacheProvider: false,
        providerOptions: providerOptions,
      });

      try {
        const provider = await web3Modal.connect({ force: true });
        app.web3 = await new Web3(provider);
      } catch (e) {
        console.log("PROVIDER_ERROR", e.message);
      }

      const netId = await app.web3.eth.net.getId();
      app.contractsFound = false;

      // Goerli or Polygon
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
      } else {
        app.network = netId;
      }
      console.log("Current network is:", netId);

      if (app.contractsFound) {
        try {
          const accounts = await app.web3.eth.getAccounts();
          window.ethereum.on("accountsChanged", function (accounts) {
            console.log("account changed ====>", accounts[0]);
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          });
          // detect Network account change
          window.ethereum.on("networkChanged", function (networkId) {
            console.log("networkChanged", networkId);
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          });
          if (accounts.length > 0) {
            app.account = accounts[0];
            localStorage.setItem("connected", true);
            app.connected = true;
            app.accountBalance = await app.web3.eth.getBalance(accounts[0]);
            console.log("account balance is", app.accountBalance);
            app.accountBalance = parseFloat(
              app.web3.utils.fromWei(app.accountBalance, "ether")
            ).toFixed(10);
            // const provider = new ethers.providers.Web3Provider(window.ethereum);

            const provider =
              window.ethereum != null
                ? new ethers.providers.Web3Provider(window.ethereum)
                : ethers.providers.getDefaultProvider();
            // Check ENS NAME
            try {
              app.ensAccount = await provider.lookupAddress(app.account);
            } catch (e) {
              console.log("No ENS Registered or compatible");
            }
            // Check Fee Data of the Network
            try {
              app.feeData = await provider.getFeeData();
              app.feeData = ethers.utils.formatUnits(
                app.feeData.maxFeePerGas,
                "gwei"
              );
              console.log("fee data is", app.feeData);
            } catch (e) {
              console.log(e.message);
            }
          } else {
            // window.location = "/";
            localStorage.setItem("connected", false);
            app.connected = false;
          }
        } catch (e) {
          console.log("USER_CONNECT", e);
          localStorage.setItem("connected", false);
          app.connected = false;
          // window.location = "/#/";
        }
      }
      app.isLoadingState = false;
      // console.log("connect loading state (end):", app.isLoadingState);
    },
    async disconnect() {
      const app = this;
      localStorage.setItem("connected", false);
      app.connected = false;
    },
    // end Connect
  },
});
