<template>
  <div class="custom-card border-primary-lighter pt-4">
    <!-- FILE -->
    <div class="mb-3 px-3">
      <p class="small">File</p>
      <p v-if="!fileToUpload.name"><b>-</b></p>
      <p v-if="fileToUpload.name">
        <b>{{ fileToUpload.name }}</b>
      </p>
    </div>
    <!-- PROTOCOL -->
    <div class="mb-3 px-3">
      <p class="small">Protocol</p>

      <p>
        <b> Web3 Bounty</b>
      </p>
    </div>
    <!-- NETWORK -->
    <div class="mb-3 px-3">
      <p class="small">Network</p>
      <p class="break-word">
        <b>{{ web3Store.protocolsContracts.Web3Bounty }}</b>
      </p>
    </div>

    <!-- DURATION -->
    <div
      class="is-flex is-align-items-center is-justify-content-space-between p-3"
    >
      <p class="">Deal Duration</p>

      <p>
        <b>365 days</b>
      </p>
    </div>
    <!-- PAYMENT -->
    <div class="divider-light"></div>
    <div
      class="is-flex is-align-items-center is-justify-content-space-between p-3"
    >
      <p class="">You are paying</p>
      <p>
        <b>free</b>
      </p>
    </div>
    <div class="divider-light"></div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";

export default {
  name: "w3b-recap-deal",
  props: ["fileToUpload"],
  computed: {
    ...mapStores(useWeb3Store),
  },
};
</script>
