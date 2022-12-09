const axios = require("axios");
const abi_web3bounty = require("./abi.json");
const CONFIG = require("../../config.json");

export function parseDeal(web3, contract_address, deal) {
  return new Promise(async (response) => {
    deal.protocol_deal = "web3bounty";
    deal.identifier = contract_address + "-" + deal.index;
    try {
      //Check STATUS ACTIVE Deal
      if (parseInt(deal.timestamp_start) > 0) {
        deal.status_active = true;
      } else {
        deal.status_active = false;
      }

      // Check Pending Deal
      if (
        deal.timestamp_start !== undefined &&
        parseInt(deal.timestamp_start) === 0 &&
        !deal.canceled
      ) {
        deal.pending = true;
      } else {
        deal.pending = false;
      }

      // Check if deal ended
      if (deal.timestamp_end * 1000 < new Date().getTime() || deal.canceled) {
        deal.status_active = false;
      }

      response(deal);
    } catch (e) {
      console.log("Parse DEAL Web3 error:", e.message);
      response(deal);
    }
  });
}

export const getAllDeals = (web3, contract_address, account) => {
  return new Promise(async (response) => {
    let parsedDeals = [];
    let config = CONFIG;
    let selectedContract = localStorage.getItem("contract");
    let apiEndpoint;
    if (selectedContract === "polygon") {
      apiEndpoint = config[2].api;
    } else if (selectedContract === "goerli") {
      apiEndpoint = config[3].api;
    } else if (selectedContract === null) {
      apiEndpoint = config[2].api;
    }
    let deals = await axios.get(apiEndpoint + "/deals/" + account);
    let keys = [];
    let txids = [];
    for (let k in deals.data) {
      let deal = await parseDeal(web3, contract_address, deals.data[k]);
      if (deal.proposal_tx !== undefined && deal.proposal_tx !== null) {
        txids.push(deal.proposal_tx);
      }
      if (keys.indexOf(parseInt(deal.index)) === -1) {
        keys.push(parseInt(deal.index));
        // Check if deal can appeal or not

        keys.push(parseInt(deal.index));
        parsedDeals.push(deal);
      }
    }
    response(parsedDeals);
    console.log("web3storage", parsedDeals);
  });
};
