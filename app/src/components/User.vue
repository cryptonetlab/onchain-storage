<template>
  <div>
    <Transition enter-active-class="fade-in-top">
      <div
        v-if="!web3Store.isLoadingState"
        class="custom-user-card border-primary-lighter"
        style="width: 100%; min-height: 142px"
      >
        <div class="p-5">
          <div
            class="is-flex is-flex-grow-2 is-align-items-start is-justify-content-space-between"
          >
            <p v-if="$route.name !== 'wallet-specs'" class="small mb-4">
              Personal Account
            </p>
            <p v-if="$route.name === 'wallet-specs'" class="small mb-4">
              User Account
            </p>
          </div>

          <div class="is-flex is-flex-grow-0 is-align-items-center">
            <div v-if="$route.name !== 'wallet-specs'">
              <v-gravatar
                v-if="isDesktop"
                class="gravatar mr-4"
                :email="web3Store.account"
                :size="95"
              />

              <v-gravatar
                v-if="!isDesktop"
                class="gravatar mr-4"
                :email="web3Store.account"
                :size="50"
              />
            </div>

            <div v-if="$route.name === 'wallet-specs'">
              <v-gravatar
                v-if="isDesktop"
                class="gravatar mr-4"
                :email="wallet"
                :size="95"
              />

              <v-gravatar
                v-if="!isDesktop"
                class="gravatar mr-4"
                :email="wallet"
                :size="50"
              />
            </div>

            <div>
              <h3
                v-if="$route.name !== 'wallet-specs'"
                class="mt-1 mb-2"
                style="font-weight: 700"
              >
                <span v-if="web3Store.ensAccount">{{
                  web3Store.ensAccount
                }}</span>
                <span v-if="!web3Store.ensAccount">My account</span>
              </h3>
              <h3
                v-if="$route.name === 'wallet-specs'"
                class="mt-1 mb-2"
                style="font-weight: 700"
              >
                Wallet
              </h3>
              <Transition enter-active-class="fade-in">
                <div v-if="!isCopying" class="is-flex is-align-items-center">
                  <p>
                    <span v-if="$route.name !== 'wallet-specs'">
                      {{ web3Store.account }}</span
                    >
                    <span v-if="$route.name === 'wallet-specs'">
                      {{ wallet }}</span
                    >
                  </p>

                  <div class="pointer ml-4" @click="copyToClipboard()">
                    <IcoCopy />
                  </div>
                </div>
              </Transition>
              <Transition enter-active-class="slide-in-left">
                <p class="mt-4" v-if="isCopying">Copied to clipboard!</p>
              </Transition>
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="columns p-0 m-0">
          <div class="column is-half p-0 m-0">
            <div class="p-5">
              <h5>Total Value</h5>
              <!-- userStore.totalValue !== undefined && userStore.totalValue > 0 -->
              <h2 v-if="userStore.totalValue !== undefined" class="mt-2">
                <span>{{ userStore.totalValue + " " }}</span>
                <span v-if="parseInt(web3Store.network) === 137">MATIC</span>
                <span v-if="parseInt(web3Store.network) === 5">gETH</span>
              </h2>

              <h2 class="mt-2" v-if="userStore.totalValue === 'error-api'">
                N/A
              </h2>
            </div>
          </div>
          <div class="column is-half b-left-light p-0 m-0">
            <div class="p-5">
              <h5>Active Deals</h5>
              <h2 class="mt-2" v-if="userStore.countDeals === 'error-api'">
                N/A
              </h2>
              <div
                v-if="
                  parseInt(userStore.countDeals) > 0 &&
                  !userStore.loadingUserInfo
                "
                class="is-flex is-align-items-flex-end"
              >
                <h2 class="m-0 mt-2">
                  {{ parseInt(userStore.countDeals) }}
                </h2>
                <p class="ml-2">
                  / on
                  {{ userStore.countActiveProtocols }} <span>protocol</span>
                  <span v-if="userStore.countActiveProtocols > 1">s</span>
                </p>
              </div>
              <div v-if="userStore.loadingUserInfo">
                <div
                  class="loading_box mt-2"
                  style="width: 130px; height: 40px"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <!-- BALANCE -->
        <!-- <div class="py-3" :class="{ 'px-5': isDesktop, 'px-3': !isDesktop }">
        <div
          class="is-flex is-align-items-center is-justify-content-space-between pointer-default"
          @click="toggleWithdraw()"
        >
          <div class="is-flex is-align-items-center">
            <div class="mr-3">
              <img src="../assets/img/eth-logo.png" alt="" />
            </div>
            <div>
              <div v-if="web3Store.accountBalance.length > 0">
                <p>
                  <span>{{ web3Store.accountBalance.substr(0, 6) }}</span>
                  <span v-if="parseInt(web3Store.network) === 5"> ETH</span>
                  <span v-if="parseInt(web3Store.network) === 137"> MATIC</span>
                </p>
              </div>
              <div v-if="web3Store.accountBalance.length === 0">
                <p>Your balance is 0</p>
              </div>
            </div>
          </div>
          <div>
            <i v-if="isWithdraw" class="mdi mdi-chevron-down"></i>
            <i v-if="!isWithdraw" class="mdi mdi-chevron-right"></i>
          </div>
        </div>

        <Transition name="slide">
          <div v-if="isWithdraw" class="px-5 py-4">
            <div class="">
              <div class="columns">
                <div class="column is-half">
                  <p class="pb-2">
                    Vault funds
                    <i class="fa-solid fa-vault ml-3"></i>
                  </p>
                  <p>
                    <b>{{ balance.substr(0, 6) }}</b>
                    <span v-if="parseInt(web3Store.network) === 5">
                      <b>ETH</b></span
                    >
                    <span v-if="parseInt(web3Store.network) === 137">
                      <b>MATIC</b></span
                    >
                  </p>
                </div>
                <div class="column is-half">
                  <div v-if="allDeals !== undefined">
                    <p class="pb-2">
                      Total Deal Created
                      <i class="fa-solid fa-file-invoice ml-3"></i>
                    </p>
                    <p>
                      <b>{{ parseInt(allDeals) }} Deals</b>
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <b-tooltip
                  class="b-tooltip-withdraw"
                  position="is-right"
                  type="is-info"
                  size="is-small"
                  :label="canWithdraw"
                  multilined
                >
                  <b-button
                    :disabled="parseInt(balance) === 0"
                    @click="$emit('withdraw')"
                    class="btn-light"
                  >
                    Withdraw
                  </b-button>
                </b-tooltip>
              </div>
            </div>
          </div>
        </Transition>
      </div> -->
        <!-- END BALANCE -->
      </div>
    </Transition>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "../stores/web3Store";
import { useUserStore } from "../stores/userStore";

import checkViewport from "../mixins/checkViewport";

const abi = require("../components/retrieval-pinning/abi.json");

// Elements adn Icons
import IcoCopy from "@/components/elements/IcoCopy.vue";
import Spinner from "@/components/elements/IcoSpinner.vue";

export default {
  name: "user",
  mixins: [checkViewport],
  props: ["wallet"],
  components: {
    IcoCopy,
    Spinner,
  },
  data() {
    return {
      abi: abi,
      isWithdraw: false,
      canWithdraw: "",
      openSelect: false,
      isCopying: false,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUserStore),
  },
  mounted() {
    const app = this;
  },
  watch: {
    balance() {
      const app = this;
      if (app.balance !== undefined && parseInt(app.balance) > 0) {
        app.canWithdraw = "Withdraw from you Vault";
      } else {
        app.canWithdraw = "Nothing to withdraw";
      }
    },
  },
  methods: {
    copyToClipboard() {
      const app = this;
      if (app.$route.name === "wallet-specs") {
        if (app.wallet) {
          app.isCopying = true;
          let copyText = app.wallet;
          navigator.clipboard.writeText(copyText).then(() => {
            console.log("Copied to Clipboard");
          });
        } else {
          console.log("Nothing to copy, make sure that you're connected!");
          app.isCopying = false;
        }
      } else {
        if (app.web3Store.account) {
          app.isCopying = true;
          let copyText = app.web3Store.account;
          navigator.clipboard.writeText(copyText).then(() => {
            console.log("Copied to Clipboard");
          });
        } else {
          console.log("Nothing to copy, make sure that you're connected!");
          app.isCopying = false;
        }
      }

      setTimeout(function () {
        app.isCopying = false;
      }, 1000);
    },
  },
};
</script>
