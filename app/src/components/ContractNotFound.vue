<template>
  <div>
    <div class="columns p-0 m-0 is-centered" v-if="!web3Store.contractsFound">
      <div
        class="custom-card border-primary-lighter column is-9 has-text-centered mt-5 py-5"
        style="position: relative; z-index: 9999"
      >
        <img width="68" class="mt-3" src="../assets/img/icon1.svg" alt="" />
        <h4 class="mt-4">No contracts in this network</h4>
        <div class="mt-2 mb-5"><p>Get started by switching network to:</p></div>
        <div
          style="min-width: 180px; text-transform: uppercase"
          class="btn-light mr-3"
          @click="web3Store.switchContract(net)"
          v-for="net in web3Store.networks"
          :key="net"
        >
          <span> {{ net }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";

export default {
  computed: {
    ...mapStores(useWeb3Store),
  },
};
</script>
