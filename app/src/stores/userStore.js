import { defineStore } from "pinia";
import axios from "axios";
////////////////////////////////////////////////////////////

export const useUserStore = defineStore("user", {
  state: () => ({
    deals: [],
    totalValue: 0,
    countDeals: 0,
    activeProtocols: "",
    countActiveProtocols: 0,
    loadingUserInfo: false,
    api: process.env.VUE_APP_API_ONCHAINSTORAGE,
  }),
  actions: {
    async fetchDeals(network, account, web3) {
      const app = this;
      app.loadingUserInfo = true;
      try {
        const deals = await axios.get(
          app.api + "/list/" + network + "/" + account
        );
        app.deals = deals.data;
        console.log("Deal value", app.deals.value);
        app.totalValue = app.deals.value;
        app.countDeals = app.deals.active;
        app.activeProtocols = app.deals.protocols;
        app.countActiveProtocols = app.deals.protocols.length;
        console.log("DEALS ARE", app.deals);
        if (app.totalValue !== undefined && app.totalValue !== null) {
          app.totalValue = parseFloat(
            web3.utils.fromWei(app.totalValue.toString(), "ether")
          ).toFixed(10);
        }
      } catch (e) {
        console.log("Api error, please retry");
        app.loadingUserInfo = false;
        // if (!account) {
        //   app.deals = "error-api";
        //   app.totalValue = "error-api";
        //   app.countDeals = "error-api";
        // }
        console.log(app.totalValue, app.countDeals);
      }

      app.loadingUserInfo = false;
    },
  },
});
