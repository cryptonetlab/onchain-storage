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
        <b> Retriev</b>
      </p>
    </div>
    <!-- NETWORK -->
    <div class="mb-3 px-3">
      <p class="small">Network</p>
      <p class="break-word">
        <b>{{ web3Store.protocolsContracts.Retriev }}</b>
      </p>
    </div>
    <!-- PROVIDER -->
    <div class="mb-6 px-3">
      <p class="small">Provider</p>
      <p v-if="dealProviders.length === 0"><b>-</b></p>
      <div v-if="dealProviders.length > 0 && providers.length > 0">
        <p
          class="break-word mb-2"
          v-for="(providerSingle, index) in dealProviders"
          :key="index"
        >
          <b class="mb-2">{{ providerSingle }} </b>
        </p>
      </div>
    </div>
    <div class="divider-light"></div>
    <!-- DURATION -->
    <div
      class="is-flex is-align-items-center is-justify-content-space-between p-3"
    >
      <p class="">Deal Duration</p>

      <p v-if="dealDurationDays !== undefined && dealDurationDays > 0">
        <b>{{ dealDurationDays }} days</b>
      </p>
    </div>
    <!-- PAYMENT -->
    <div class="divider-light"></div>
    <div
      class="is-flex is-align-items-center is-justify-content-space-between p-3"
    >
      <p class="">You are paying</p>
      <p v-if="dealValue !== undefined && parseInt(dealValue) > 0">
        <b>{{ dealValue }} wei</b>
      </p>
      <p v-if="dealValue !== undefined && parseInt(dealValue) === 0">
        <b>free</b>
      </p>
    </div>
    <div class="divider-light"></div>
    <div
      class="is-flex is-align-items-center is-justify-content-space-between p-3"
    >
      <p class="">Collateral</p>
      <p>
        <b>{{ dealCollateral }} wei</b>
      </p>
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";

export default {
  name: "recap-retriev-deal",
  props: [
    "providers",
    "dealCollateral",
    "dealValue",
    "dealDurationDays",
    "dealProviders",
    "fileToUpload",
    "custom",
  ],

  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },
};
</script>
