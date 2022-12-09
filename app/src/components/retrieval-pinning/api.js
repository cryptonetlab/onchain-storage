const axios = require("axios");
const abi_retriev = require("./abi.json");
const CONFIG = require("../../config.json");

export function parseDeal(web3, contract_address, deal) {
  return new Promise(async (response) => {
    deal.protocol_deal = "retrieval_pinning";
    deal.canAppeal = true;

    // Fix needed to be compatible to old contract
    if (deal.deal_uri === undefined) {
      deal.deal_uri = deal.data_uri;
    }
    if (deal.data_uri === undefined) {
      deal.data_uri = deal.deal_uri;
    }

    // TODO: Optimize contract
    const contract = new web3.eth.Contract(abi_retriev, contract_address);
    try {
      console.log("Asking proposal timeout..");
      let proposalTimeout = await contract.methods.proposal_timeout().call();
      console.log("Asking active appeals..");
      const appeal_index = await contract.methods
        .active_appeals(deal.deal_uri)
        .call();
      console.log("Asking round..");
      const round = await contract.methods.getRound(appeal_index).call();
      console.log(
        "deal " + deal.index + " with appeal index ",
        appeal_index + " have a round " + round
      );

      // Check STATUS ACTIVE Deal
      if (
        (parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 &&
          deal.appeal !== undefined &&
          deal.appeal.round === undefined) ||
        (parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 &&
          deal.appeal !== undefined &&
          deal.appeal.round !== undefined &&
          deal.appeal.round === 99 &&
          deal.appeal.slashed !== undefined &&
          deal.appeal.slashed === false)
      ) {
        deal.status_active = true;
      } else {
        deal.status_active = false;
      }

      // Check Pending deal
      if (
        deal.timestamp_start !== undefined &&
        parseInt(deal.timestamp_start) === 0 &&
        !deal.canceled
      ) {
        deal.pending = true;
        deal.canAppeal = false;
      } else {
        deal.pending = false;
      }

      // Check if deal ended
      if (deal.timestamp_end * 1000 < new Date().getTime() || deal.canceled) {
        deal.canAppeal = false;
        deal.status_active = false;
      }

      // Set expiration timestamp
      const expires_at =
        (parseInt(deal.timestamp_request) + parseInt(proposalTimeout)) * 1000;

      // Check if expired
      if (new Date().getTime() > expires_at && deal.timestamp_start === 0) {
        deal.expired = true;
        deal.canAppeal = false;
      } else if (
        new Date().getTime() < expires_at &&
        deal.timestamp_start === 0
      ) {
        deal.expired = false;
        deal.status_active = false;
      }

      // Check if appeal ended
      if (
        deal.appeal !== undefined &&
        deal.appeal.round !== undefined &&
        parseInt(deal.appeal.round) < 99
      ) {
        deal.canAppeal = false;
      }

      // Check if appeal doesn't exists
      if (deal.appeal === undefined || Object.keys(deal.appeal) === 0) {
        deal.canAppeal = true;
      }

      // Check Contract Deal
      if (deal.contract !== contract) {
        deal.canAppeal = false;
      }
      // Getting round appel
      response(deal);
    } catch (e) {
      console.log("Parse DEAL retriev error", e.message);
      console.log(deal, "contract:", contract_address);
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
      apiEndpoint = config[0].api;
    } else if (selectedContract === "goerli") {
      apiEndpoint = config[1].api;
    } else if (selectedContract === null) {
      apiEndpoint = config[0].api;
    }
    console.log("API RETRIEV", apiEndpoint);
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

        // Getting active deals

        keys.push(parseInt(deal.index));
        parsedDeals.push(deal);
      }
    }
    response(parsedDeals);
    console.log("Retriev", parsedDeals);
  });
};
