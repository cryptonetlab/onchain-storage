import { defineStore } from "pinia";
////////////////////////////////////////////////////////////
import axios from "axios";
import { ethers } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

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
      // Fetching data by contract selected
      if (localStorage.getItem("contract") === null) {
        localStorage.setItem("contract", "polygon");
      }
      // if (window.ethereum !== undefined) {
      //   window.ethereum.on("chainChanged", function (accounts) {
      //     app.connect();
      //   });
      // }
      app.selectedContract = localStorage.getItem("contract");
      console.log("CONTRACT Selected is:", app.selectedContract);

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

      console.log(
        "contract spec",
        "address",
        app.protocolsContracts,
        "network",
        app.network
      );

      app.fetchEndpoints();
      await app.connect();
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
    async switchNetwork() {
      const app = this;
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0x" + Number(app.network).toString(16),
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
                  chainId: "0x" + Number(app.network).toString(16),
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
          }
        } else {
          alert("Can't switch network, please do it manually.");
        }
      }
      window.location.reload();
    },
    switchContract(net) {
      const app = this;
      app.isLoadingState = true;
      console.log("NEt is", net);
      localStorage.setItem("contract", net);
      console.log(
        "Funtcion selectContract CONTRACT",
        localStorage.getItem("contract")
      );
      window.location.reload();
    },
    // End switch network

    // Connect wallet functions
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
        // window.location = "/#/";
      }

      const netId = await app.web3.eth.net.getId();
      console.log("Current network is:", netId);

      if (parseInt(netId) === parseInt(app.network)) {
        try {
          const accounts = await app.web3.eth.getAccounts();
          // window.ethereum.on("accountsChanged", function (accounts) {
          //   console.log("account changed ====>", accounts[0]);
          //   setTimeout(function () {
          //     window.location.reload();
          //   }, 1000);
          // });
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
      } else {
        localStorage.setItem("connected", false);
        app.connected = false;
        app.switchNetwork();
      }
      app.isLoadingState = false;
    },
    disconnect() {
      const app = this;
      localStorage.setItem("connected", false);
      app.connected = false;
    },
    // end Connect
  },
});
