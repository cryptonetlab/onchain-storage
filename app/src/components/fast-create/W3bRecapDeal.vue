<template>
  <div>
    <p class="small mt-5 mb-2" style="font-weight: 500 !important">
      Deal Summary
    </p>
    <div class="custom-card border-primary-lighter">
      <div
        class="is-flex is-align-items-center is-justify-content-space-between py-4 px-3"
      >
        <p class="small">Deal duration</p>
        <p class="small">
          <b> 365 days</b>
        </p>
      </div>
      <div class="divider"></div>
      <div
        class="is-flex is-align-items-center is-justify-content-space-between py-4 px-3"
      >
        <p class="small">You are paying</p>
        <p>
          <b>free</b>
        </p>
      </div>
      <div class="divider"></div>
      <div
        class="is-flex is-align-items-center is-justify-content-space-between py-4 px-3"
      >
        <p class="small">Network</p>
        <p class="break-word">
          <b>{{
            web3Store.protocolsContracts.Web3Bounty.substr(0, 4) +
            "..." +
            web3Store.protocolsContracts.Web3Bounty.substr(-4)
          }}</b>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";

export default {
  name: "w3b-recap-deal-dashboard",
  computed: {
    ...mapStores(useWeb3Store),
  },
};
</script>
