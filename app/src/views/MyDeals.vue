<template>
  <div class="full bg-primary-color-contrast">
    <!-- NAVBAR SECTION -->
    <Navbar
      :loading="loading"
      :balance="balance"
      :navSpec="navSpec"
      :referees="referees"
      @toggleSpec="toggleSpec()"
      @loadState="loadState()"
      @notify="showToast($event)"
      @searchDealURI="searchDealURI($event)"
    />
    <!-- END | NAVBAR SECTION -->

    <!-- MOBILE BLOCKER DAPP -->
    <MobileBlocker />
    <!-- END MOBILE BLOCKER DAPP -->

    <div
      v-if="!isMobile"
      :class="{ 'no-scroll': isWorking }"
      style="height: 100%; padding-top: 70px"
    >
      <!-- LOADER DEALS -->
      <div
        v-if="loading && web3Store.account"
        class="mt-6 mb-6 has-text-centered pulse_loading"
      >
        <div class="btn-loader">
          <div class="m-0">
            <i class="mdi mdi-loading mdi-spin mr-3"></i> LOADING DEALS...
          </div>
        </div>
      </div>
      <!-- END LOADER DEALS -->

      <div v-if="!loading" class="columns is-mobile m-0" style="height: 100%">
        <!-- SIDEBAR -->
        <div
          style="transition: all 0.25s"
          class="column p-0"
          :class="{
            'is-1': !utilsStore.showSidebar,
            'is-2-tablet is-2-desktop': utilsStore.showSidebar,
          }"
        >
          <Sidebar />
        </div>
        <!-- END SIDEBAR -->

        <!-- DEAL LIST -->
        <div
          style="transition: all 0.25s"
          class="column p-0"
          :class="{
            'is-11-mobile is-11-tablet is-11-desktop': !utilsStore.showSidebar,
            'is-10-mobile is-10-tablet is-10-desktop': utilsStore.showSidebar,
          }"
        >
          <div
            class="columns is-centered is-mobile m-0 py-6"
            :class="{ 'px-6': isDesktop, 'px-3': !isDesktop }"
            style="transition: all 0.25s; overflow-y: auto; height: 100%"
          >
            <div class="column is-12-tablet is-10-desktop">
              <User />

              <!-- ===================== DEALS LIST ===================== -->

              <!-- ACTION BAR (button create deal - searchbar - filters) -->
              <div class="has-text-right px-5 mt-2 mb-2">
                <!-- FILTER FUNCTIONS -->
                <div>
                  <div class="custom_dropdown me-10-desktop">
                    <div
                      class="custom_dropdown__face"
                      @click="filtered = !filtered"
                    >
                      <div class="custom_dropdown__text">
                        <span class="small mr-2">Status:</span>
                        <span v-if="activeDeal"><b>Active</b></span>
                        <span
                          v-if="endedDeal !== undefined && endedDeal === true"
                          ><b>Ended</b></span
                        >
                        <span v-if="showallDeals"><b>All</b></span>
                        <i
                          v-if="!filtered"
                          class="ml-3 mdi mdi-chevron-right"
                        ></i>
                        <i
                          v-if="filtered"
                          class="ml-3 mdi mdi-chevron-down"
                        ></i>
                      </div>
                    </div>
                    <Transition
                      name="custom-fade"
                      enter-active-class="fade-in-top"
                      leave-active-class="fade-out-top"
                    >
                      <ul v-if="filtered" class="custom_dropdown__items">
                        <li
                          @click="
                            (showallDeals = true),
                              (activeDeal = false),
                              (endedDeal = false),
                              (filtered = false),
                              filterAll()
                          "
                        >
                          All
                        </li>
                        <li
                          @click="
                            (activeDeal = true),
                              (showallDeals = false),
                              (endedDeal = false),
                              (filtered = false),
                              filterActive()
                          "
                        >
                          Active
                        </li>
                        <li
                          @click="
                            (endedDeal = true),
                              (showallDeals = false),
                              (activeDeal = false),
                              (filtered = false),
                              filterEnded()
                          "
                        >
                          Ended
                        </li>
                      </ul>
                    </Transition>
                  </div>
                </div>
                <!-- END | FILTER FUNCTION -->
              </div>
              <!-- END | ACTION BAR (button create deal - searchbar - filters) -->

              <div class="pb-6" v-if="filteredDeals.length > 0">
                <!-- DEALS -->
                <div class="pt-2">
                  <div
                    v-for="(deal, index) in filteredDeals"
                    :key="deal.identifier"
                  >
                    <RetrievDeal
                      v-if="deal.protocol_deal === 'retrieval_pinning'"
                      :storedDeal="deal"
                      :index="index"
                      @toggleSpec="toggleSpec()"
                      @alert="alertCustomError($event)"
                    />
                    <Web3BountyDeal
                      v-if="deal.protocol_deal === 'web3bounty'"
                      :storedDeal="deal"
                      :index="index"
                      @loadState="loadState()"
                      @toggleSpec="toggleSpec()"
                      @alert="alertCustomError($event)"
                    />
                  </div>
                </div>
                <!-- DEALS -->
              </div>

              <!-- NO DEALS -->
              <p
                v-if="
                  !loading &&
                  filteredDeals.length === 0 &&
                  searcher.length === 0 &&
                  endedDeal !== undefined &&
                  endedDeal === false
                "
              >
                You have no active Deals or Proposal. Create a new one or view
                the history of Deals you have created.
              </p>
              <p
                v-if="
                  (!loading &&
                    filteredDeals.length === 0 &&
                    searcher.length > 0) ||
                  (filteredDeals.length === 0 &&
                    endedDeal !== undefined &&
                    endedDeal === true)
                "
              >
                No deals found... try again!
              </p>
              <!-- END | NO DEALS -->
            </div>
          </div>
        </div>
        <!-- END DEAL LIST -->
      </div>
    </div>
  </div>
</template>
<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "../stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";

import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import MobileBlocker from "@/components/elements/MobileBlocker.vue";
import User from "@/components/User.vue";
import checkViewport from "@/mixins/checkViewport";

// TODO: Add to retriev p2p
const axios = require("axios");

// Protocol Components Specifications
import RetrievDeal from "@/components/retrieval-pinning/RetrievDeal.vue";
import Web3BountyDeal from "@/components/web3-storage/Web3BountyDeal.vue";

export default {
  name: "deals-list",
  mixins: [checkViewport],
  components: {
    Navbar,
    Sidebar,
    MobileBlocker,
    User,
    RetrievDeal,
    Web3BountyDeal,
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },
  async mounted() {
    const app = this;
    if (!app.stateIsLoaded) {
      if (app.web3Store.web3) {
        app.stateIsLoaded = true;
        await app.loadState();
      } else {
        const unsubscribe = app.web3Store.$onAction(
          ({ name, store, after }) => {
            after(async () => {
              if (name === "connect" || name === "switchNetwork") {
                console.log("Try load State");
                if (store.web3) {
                  app.stateIsLoaded = true;
                  await app.loadState();
                  unsubscribe();
                }
              }
            });
          }
        );
      }
    }
  },
  data() {
    return {
      // This is a VAR tha allow connection or not
      stateIsLoaded: false,

      referees: [],
      opensea: "",
      balance: 0,

      loading: false,
      isWorking: false,
      isToasting: false,
      workingMessage: "",
      deals: [],
      filteredDeals: [],
      txids: [],
      logs: "",
      dealUri: "",
      infuraURL: "https://ipfs.infura.io:5001/api/v0/add",
      appealAddress: "",
      pendingTx: "",

      // FOR LAYOUT
      navSpec: false,

      // FILTER
      changeNetwork: false,
      filtered: false,
      activeDeal: true,
      endedDeal: false,
      isFilterEnded: false,
      showallDeals: false,
      searcher: "",
    };
  },
  methods: {
    async loadState() {
      console.log("Im in loadState function");
      const app = this;
      if (!app.loading) {
        // Reset deals
        app.loading = true;
        app.deals = [];
        // Get active deals from all protocols
        try {
          for (let p in app.web3Store.protocols) {
            if (
              app.web3Store.protocolsApis[app.web3Store.protocols[p]] !==
              undefined
            ) {
              console.log(
                "Reading active deals from:",
                app.web3Store.protocols[p]
              );
              const protocolDeals = await app.web3Store.protocolsApis[
                app.web3Store.protocols[p]
              ].getAllDeals(
                app.web3Store.web3,
                app.web3Store.protocolsContracts[app.web3Store.protocols[p]],
                app.web3Store.account
              );
              for (let j in protocolDeals) {
                app.deals.push(protocolDeals[j]);
              }
            }
          }
          app.filteredDeals = app.deals;
          app.filterActive();
        } catch (e) {
          console.log(e.message);
        }

        // Get active deals from Web3Bounty
        app.isWorking = false;
        app.loading = false;
        app.searchPending();
        if (app.$route.params.searcher !== undefined) {
          app.searchDealURI(app.$route.params.searcher);
        }
      }
    },
    log(...what) {
      const app = this;
      console.log(what);
      const temp = app.logs;
      app.logs = "";
      for (let k in what) {
        try {
          app.logs = JSON.stringify(what[k]);
        } catch (e) {
          app.logs = what[k];
        }
      }
      app.logs += "<hr>" + temp;
    },
    async searchPending() {
      const app = this;
      const pendingTx = localStorage.getItem("pendingTx");
      const pendingProtocol = localStorage.getItem("pendingProtocol");
      app.pendingTx = pendingTx;

      console.log("Stored pending tx:", pendingTx);

      let found = false;
      if (pendingTx === null || pendingTx.length === 0) {
        found = true;
        app.$toast.clear();
      } else if (iteration === 10) {
        found = false;
      }
      let iteration = 0;
      if (!found && iteration < 10) {
        iteration++;
        console.log("iteration is:", iteration);
        let pendingDeals = await axios.get(
          app.web3Store.protocolEndpoints[pendingProtocol] +
            "/deals/" +
            app.web3Store.account
        );
        let deals = pendingDeals.data;
        console.log("seraching in all deals", deals);
        for (let k in deals) {
          let deal = deals[k];
          if (
            deal.proposal_tx !== undefined &&
            deal.proposal_tx === pendingTx
          ) {
            found = true;
            if (app.txids.indexOf(deal.proposal_tx) === -1) {
              console.log("Txid found in deal list");
              app.txids.push(deal.proposal_tx);
              console.log(
                "Parsing deal for protocol:",
                pendingProtocol,
                app.web3Store.protocolsApis[pendingProtocol]
              );
              let parsedDeal = await app.web3Store.protocolsApis[
                pendingProtocol
              ].parseDeal(
                app.web3,
                app.web3Store.protocolsContracts[pendingProtocol],
                deal
              );
              app.deals.push(parsedDeal);
            }
          }
        }
        // Still not found
        if (!found) {
          app.log("Pending tx not found, refreshing in 2 seconds..");
          setTimeout(function () {
            app.$toast.clear();
            app.searchPending();
          }, 5000);
        } else {
          app.log("Pending tx found, removing from cache.");
          localStorage.removeItem("pendingTx");
          localStorage.removeItem("pendingProtocol");
          app.pendingTx = "";
          // this.$toast("Pending tx found, removing from cache.", {
          //   position: "top-right",
          //   timeout: 2000,
          //   closeOnClick: true,
          //   pauseOnFocusLoss: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   draggablePercent: 0.6,
          //   showCloseButtonOnHover: true,
          //   hideProgressBar: true,
          //   closeButton: "button",
          //   icon: "mdi mdi-check-circle",
          //   rtl: false,
          // });
        }
      } else {
        app.$toast.clear();
      }
    },

    // NOTIFICATION AND ALERT
    showToast(message) {
      const app = this;
      if (!app.isToasting) {
        app.isToasting = true;
        app.$toast(message, {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: true,
          hideProgressBar: true,
          closeButton: "button",
          icon: "mdi mdi-check-bold",
          rtl: false,
        });
        setTimeout(function () {
          app.isToasting = false;
        }, 6200);
      }
    },
    showErrorToast(message) {
      const app = this;
      if (!app.isToasting) {
        app.isToasting = true;
        app.$toast.error(message, {
          position: "top-right",
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: true,
          hideProgressBar: true,
          closeButton: "button",
          icon: true,
          rtl: false,
        });
        setTimeout(function () {
          app.isToasting = false;
        }, 6200);
      }
    },
    alertCustomError(message) {
      this.$buefy.dialog.alert({
        title: "Error",
        message: message,
        type: "is-danger",
        hasIcon: true,
        icon: "times-circle",
        iconPack: "fa",
        ariaRole: "alertdialog",
        ariaModal: true,
      });
    },

    // FILTERS
    async filterEnded() {
      const app = this;
      app.filteredDeals = app.deals;
      app.filteredDeals = app.filteredDeals.filter((deal) => {
        return deal.status_active === false;
      });
      console.log("Ended Deals", app.filteredDeals);
      app.isFilterEnded = true;
    },
    async filterActive() {
      const app = this;
      app.isFilterEnded = false;
      app.filteredDeals = app.filteredDeals.filter((deal) => {
        return deal.status_active === true;
      });
      console.log("Active Deals", app.filteredDeals);
    },
    async filterAll() {
      const app = this;
      app.isFilterEnded = false;
      app.filteredDeals = app.deals;
      app.filteredDeals = app.filteredDeals.filter((deal) => {
        return deal.status_active === true || deal.status_active === false;
      });
      console.log("All Deals", app.filteredDeals);
    },
    searchDealURI(searcher) {
      console.log("Starting search...");
      const app = this;
      app.searcher = searcher;
      if (app.searcher.length > 0) {
        app.filteredDeals = app.deals.filter((deal) => {
          return deal.data_uri
            .toLowerCase()
            .includes(app.searcher.toLowerCase());
        });

        console.log("deal founded", app.deals);
      } else if (app.searcher.length === 0) {
        console.log("Wathing SAERCHER IS: ", app.searcher);
        app.filteredDeals = app.deals;
      }
    },
    toggleSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
    },
  },
};
</script>

<style></style>
