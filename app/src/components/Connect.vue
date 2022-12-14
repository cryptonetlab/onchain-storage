<template>
  <div>
    <div
      class="columns p-0 m-0 is-centered"
      v-if="!web3Store.connected && web3Store.contractsFound"
    >
      <div
        class="custom-card border-primary-lighter column is-9 has-text-centered mt-5 py-5"
        style="position: relative; z-index: 9999"
      >
        <img width="68" class="mt-3" src="../assets/img/icon1.svg" alt="" />
        <h4 class="mt-4">No Wallet connected</h4>
        <div class="mt-2"><p>Get started by connecting your wallet</p></div>
        <div class="btn-light mt-4 mb-3" @click="web3Store.connect()">
          Connect Wallet
        </div>
      </div>
    </div>
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
    <div
      v-if="
        web3Store.connected &&
        userStore.deals !== undefined &&
        userStore.deals.active === 0 &&
        !web3Store.isLoadingState
      "
      class="container p-5"
    >
      <div class="columns p-0 m-0">
        <div
          class="custom-card border-primary-lighter column is-12 has-text-centered py-5"
          style="position: relative; z-index: 9999"
        >
          <img width="68" class="mt-3" src="../assets/img/icon1.svg" alt="" />
          <h4 class="mt-4">No Deals in this network</h4>
          <div class="mt-2 mb-5">
            <p>Get started by switching network or creating a new one</p>
          </div>
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
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import { useUserStore } from "../stores/userStore";

export default {
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUserStore),
  },
};
</script>
