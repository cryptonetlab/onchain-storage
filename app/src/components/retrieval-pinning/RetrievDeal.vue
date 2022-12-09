<template>
  <div
    class="custom-card border-primary-lighter py-2 mb-3"
    :class="{ pointer: !isOpen, 'custom-card-hover': !isOpen }"
  >
    <div
      @click="toggleDeal()"
      class="card-header p-0 is-justify-content-space-between"
    >
      <div class="is-flex is-align-items-center">
        <h4 class="px-4" style="cursor: pointer">Deal ID: #{{ deal.index }}</h4>
        <div class="badge badge-transparent">
          <span> RETRIEV</span>
        </div>
        <div v-if="refreshingDeal" class="ml-4"><IcoSpinner /></div>
      </div>

      <!-- Deal action bar -->
      <div class="is-flex is-align-items-center is-flex-wrap-wrap">
        <!-- download file button -->
        <!-- <b-button
          @click="
            downloadFile(
              providerEndpoints[deal.provider] +
                '/ipfs/' +
                deal.deal_uri.replace('ipfs://', '')
            )
          "
          :disabled="
            new Date().getTime() > parseInt(deal.timestamp_end * 1000) ||
            parseInt(deal.timestamp_start * 1000) === 0
          "
          class="btn-icon"
        >
          <i class="fa-solid fa-download"></i>
        </b-button> -->

        <!-- BADGES -->
        <div>
          <!-- active badge -->
          <div
            v-if="
              (deal.protocol_deal === 'retrieval_pinning' &&
                parseInt(deal.timestamp_end) - new Date().getTime() / 1000 >
                  0 &&
                deal.appeal !== undefined &&
                deal.appeal.round === undefined) ||
              (parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0 &&
                deal.appeal !== undefined &&
                deal.appeal.round !== undefined &&
                deal.appeal.round === 99 &&
                deal.appeal.slashed !== undefined &&
                deal.appeal.slashed === false) ||
              (deal.protocol_deal === 'web3bounty' &&
                parseInt(deal.timestamp_start) > 0 &&
                deal.accept_tx.length > 0)
            "
            class="badge badge-success"
          >
            <span>Active</span>
          </div>

          <!-- ended badge -->
          <div
            v-if="
              parseInt(deal.timestamp_end) - new Date().getTime() / 1000 < 0 &&
              !deal.canceled &&
              deal.timestamp_start > 0
            "
            class="badge badge-ended"
          >
            <span>Ended</span>
          </div>

          <!-- canceled badge -->
          <div v-if="deal.canceled" class="badge badge-ended">
            <span>Canceled</span>
          </div>

          <!-- pending badge -->
          <div v-if="deal.pending" class="badge badge-pending">
            <span>Pending</span>
          </div>

          <!-- appeal badge -->
          <div
            v-if="
              deal.appeal !== undefined &&
              deal.appeal.round !== undefined &&
              parseInt(deal.appeal.round) < 99 &&
              parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0
            "
            class="badge badge-requested"
          >
            <span>Appeal</span>
          </div>

          <!-- slashed badge -->
          <div
            v-if="
              deal.appeal !== undefined &&
              deal.appeal.round !== undefined &&
              deal.slashed !== undefined &&
              deal.slashed === true
            "
            class="badge badge-slashed"
          >
            <span>Slashed</span>
          </div>

          <!-- expired badge -->
          <div
            v-if="
              deal.timestamp_start !== undefined &&
              parseInt(deal.timestamp_start) === 0 &&
              deal.expired &&
              !deal.canceled
            "
            class="badge badge-expired"
          >
            <span>Expired</span>
          </div>
        </div>
        <!-- END BADGES -->

        <div class="ml-3 mr-3"></div>
        <div class="mr-3 p-3">
          <i
            v-if="isOpen !== deal.index"
            class="mdi mdi-chevron-right"
            aria-hidden="true"
          ></i>
          <i
            v-if="isOpen === deal.index"
            class="mdi mdi-chevron-down"
            aria-hidden="true"
          ></i>
        </div>
      </div>
      <!-- Deal action bar -->
    </div>

    <!-- DEAL SPECIFICATIONS -->
    <Transition name="slide">
      <div class="" v-show="isOpen === deal.index">
        <div class="card-content">
          <div class="content">
            <div v-if="deal.data_uri !== undefined">
              <p class="pl-4 mb-2">File informations</p>
              <div
                class="custom-card border-primary-lighter is-flex is-flex-direction-column"
              >
                <div
                  class="is-flex is-align-items-center is-justify-content-space-between p-3"
                >
                  <p>Deal URI:</p>
                  <a
                    v-if="
                      web3Store.providerEndpoints[deal.provider] !== undefined
                    "
                    style="word-wrap: break-word"
                    :href="
                      web3Store.providerEndpoints[deal.provider] +
                      '/ipfs/' +
                      deal.data_uri.replace('ipfs://', '')
                    "
                    target="_blank"
                    >{{ deal.data_uri }}</a
                  >
                  <a
                    v-if="
                      web3Store.providerEndpoints[deal.provider] === undefined
                    "
                    style="word-wrap: break-word"
                    class="link-primary break-word"
                    :href="
                      'https://ipfs.io/ipfs/' +
                      deal.data_uri.replace('ipfs://', '')
                    "
                    target="_blank"
                    >{{ deal.data_uri }}</a
                  >
                </div>
              </div>
              <div class="has-text-right mt-3">
                <a
                  :class="{
                    'no-pointer': parseInt(deal.timestamp_start * 1000) === 0,
                  }"
                  :href="
                    web3Store.retrievOpensea +
                    '/' +
                    web3Store.protocolsContracts.Retriev +
                    '/' +
                    deal.index
                  "
                  target="_blank"
                >
                  <b-button
                    :disabled="parseInt(deal.timestamp_start * 1000) === 0"
                    class="btn-light"
                  >
                    <i class="mdi mdi-file-export mr-2" aria-hidden="true"></i
                    >Check NFT</b-button
                  ></a
                >
              </div>
            </div>
            <p class="pl-4 mb-2">Deal details</p>
            <div
              class="custom-card border-primary-lighter is-flex is-flex-direction-column"
            >
              <div
                v-if="deal.provider !== undefined"
                class="is-flex is-align-items-center is-justify-content-space-between p-3"
              >
                <p>Provider:</p>

                <p>
                  <b>
                    <span v-if="deal.provider !== 'NOT_ACCEPTED'">
                      {{ deal.provider }}</span
                    >
                    <span v-if="deal.provider === 'NOT_ACCEPTED'">
                      Pending Approval</span
                    >
                    <span v-if="deal.protocol_deal === 'web3bounty'">
                      https://w3-b.link/</span
                    ></b
                  >
                </p>
              </div>
              <div class="divider"></div>
              <div
                class="is-flex is-align-items-center is-justify-content-space-between p-3"
              >
                <p>Value:</p>
                <p v-if="deal.protocol_deal === 'retrieval_pinning'">
                  <b>{{ deal.value }}</b>
                </p>
                <p v-if="deal.protocol_deal === 'web3bounty'">
                  <b>Free</b>
                </p>
              </div>
              <div
                v-if="deal.protocol_deal === 'retrieval_pinning'"
                class="divider"
              ></div>
              <div
                v-if="deal.protocol_deal === 'retrieval_pinning'"
                class="is-flex is-align-items-center is-justify-content-space-between p-3"
              >
                <p>Collateral:</p>
                <p>
                  <b>{{ deal.collateral }}</b>
                </p>
              </div>
              <div
                v-if="
                  parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0
                "
                class="divider"
              ></div>
              <div
                v-if="
                  parseInt(deal.timestamp_end) - new Date().getTime() / 1000 > 0
                "
                class="is-flex is-align-items-center is-justify-content-space-between p-3"
              >
                <p>Duration:</p>
                <p>
                  <b>{{
                    secondsToD(
                      parseInt(deal.timestamp_end) - new Date().getTime() / 1000
                    )
                  }}</b>
                  Ends on {{ returnDate(deal.timestamp_end) }}
                </p>
              </div>
            </div>
            <p
              v-if="deal.protocol_deal === 'retrieval_pinning'"
              class="pl-4 mb-2 mt-5"
            >
              Oracle details
            </p>
            <div>
              <div
                v-if="deal.protocol_deal === 'retrieval_pinning'"
                class="custom-card border-primary-lighter is-flex is-flex-direction-column"
              >
                <div
                  class="is-flex is-align-items-center is-justify-content-space-between p-3"
                >
                  <p>Referee network</p>
                  <p>
                    <b>
                      <a
                        style="word-wrap: break-word"
                        class="link-primary"
                        @click="$emit('toggleSpec')"
                        target="_blank"
                        >Referee network #1</a
                      ></b
                    >
                  </p>
                </div>
                <div class="divider"></div>
                <div
                  v-if="deal.appeal_requested !== undefined"
                  class="is-flex is-align-items-center is-justify-content-space-between p-3"
                >
                  <p>Appeals left:</p>
                  <p>
                    <b>{{ 5 - deal.appeal_requested }} </b
                    ><em
                      >(Each appeal cost
                      <b v-if="appealFee !== undefined">{{ appealFee }}</b>
                      wei)</em
                    >
                  </p>
                </div>
                <div
                  v-if="
                    deal.appeal !== undefined &&
                    deal.appeal.round !== undefined &&
                    parseInt(deal.appeal.round) < 99
                  "
                  class="p-5"
                >
                  <div
                    class="is-flex is-align-items-center is-justify-content-space-between"
                  >
                    <p>Appeal status:</p>
                    <b-progress
                      size="is-medium"
                      type="is-primary"
                      :max="100"
                      :value="(deal.appeal.round / 12) * 100"
                      show-value
                      rounded
                      :precision="0"
                    ></b-progress>
                  </div>
                  <p class="has-text-right mt-1">
                    Estimated time left <b>2 hours</b>
                  </p>
                </div>
              </div>
              <div class="has-text-right mt-3">
                <b-button
                  v-if="deal.protocol_deal === 'retrieval_pinning'"
                  @click="createAppeal()"
                  :disabled="
                    deal.timestamp_start === 0 ||
                    deal.provider === 'NOT_ACCEPTED' ||
                    deal.contract !== web3Store.protocolsContracts.Retriev ||
                    deal.pending === true ||
                    isWorking
                  "
                  class="btn-light"
                >
                  <i class="mdi mdi-bell mr-2"></i>Request appeal
                </b-button>
                <!-- <a
                  href="https://retriev.org"
                  target="_blank"
                  class="btn-light ml-3"
                  style="text-decoration: none"
                >
                  Go to Retriev
                </a> -->
                <b-button
                  :disabled="
                    (deal.canceled !== undefined && deal.canceled === true) ||
                    deal.pending === false
                  "
                  class="btn-light ml-3"
                  @click="isDeletingDeal()"
                >
                  <i class="mdi mdi-trash-can-outline mr-2"></i
                  ><span>Delete Deal</span>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import axios from "axios";
import checkViewport from "@/mixins/checkViewport";
const abi = require("./abi.json");

import IcoSpinner from "@/components/elements/IcoSpinner.vue";
export default {
  name: "Deal",
  mixins: [checkViewport],
  props: ["storedDeal", "index"],
  components: {
    IcoSpinner,
  },
  data() {
    return {
      openTimingDeal: false,
      download: false,
      isOpen: -1,
      isWorking: false,
      deal: {},
      dealProviders: [],
      appealFee: 0,
      abi: abi,
      refreshingDeal: false,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
  },
  mounted() {
    const app = this;
    app.deal = app.storedDeal;
    if (app.deal.appeal === undefined) {
      app.deal.appeal = {};
    }
  },
  methods: {
    async toggleDeal() {
      const app = this;
      app.download = false;
      if (app.isOpen === app.deal.index) {
        app.isOpen = -1;
      } else {
        app.isOpen = app.deal.index;
        console.log("Opening deal", app.isOpen);
        app.refreshDeal();
        // Fix needed to be compatible to old contract
        if (app.deal.deal_uri === undefined) {
          app.deal.deal_uri = app.deal.data_uri;
        }
        if (app.deal.data_uri === undefined) {
          app.deal.data_uri = app.deal.deal_uri;
        }
        if (
          app.web3Store.providerEndpoints.Retriev[app.deal.provider] !==
          undefined
        ) {
          const uri =
            app.web3Store.providerEndpoints.Retriev[app.deal.provider] +
            "/ipfs/" +
            app.deal.data_uri.replace("ipfs://", "");
          try {
            console.log("Downloading file from:", uri);
            const downloaded = await axios.get(uri);
            if (downloaded.data !== undefined) {
              // app.download[app.deal.deal_uri] = true;
              app.download = true;
              console.log("download became", app.download);
            }
          } catch (e) {
            console.log("Error while downloading from:", uri);
          }
        }

        // Fetching appeal fee
        try {
          console.log("starting fetching appelFee");
          const contract = new app.web3Store.web3.eth.Contract(
            app.abi,
            app.web3Store.providerEndpoints.Retriev
          );
          const appeal_fee = await contract.methods
            .returnAppealFee(app.deal.index)
            .call();
          app.appealFee = appeal_fee;
          console.log("Appeal Fee is:", app.appealFee);
        } catch (e) {
          console.log("Error while calculating appel fee");
        }
      }
    },
    async refreshDeal() {
      const app = this;
      console.log("Refreshing deal", app.deal);
      if (!app.isWorking) {
        if (app.deal.protocol_deal === "retrieval_pinning") {
          try {
            app.refreshingDeal = true;
            let refreshed = await axios.get(
              app.web3Store.protocolEndpoints.Retriev +
                "/parse/" +
                app.deal.contract +
                "/" +
                app.deal.index
            );
            console.log("refreshed", refreshed.data);
            app.deal = refreshed.data;

            // PERSER DEAL
            app.deal.protocol_deal = "retrieval_pinning";
            if (
              app.deal.timestamp_start !== undefined &&
              parseInt(app.deal.timestamp_start) === 0 &&
              !app.deal.canceled
            ) {
              app.deal.pending = true;
            } else {
              app.deal.pending = false;
            }
            app.deal.provider = app.deal.provider.toLowerCase();
            // END PARSER DEAL
            
            app.refreshingDeal = false;
            app.$forceUpdate();
          } catch (e) {
            app.$emit("alert", e.message);
            app.refreshingDeal = false;
          }
        } else {
          console.log("To do refresh for web3");
          app.refreshingDeal = false;
        }
      } else {
        console.log("Working, please wait..");
        app.refreshingDeal = false;
      }
    },
    async createAppeal() {
      const app = this;
      const index = app.deal.index;
      console.log("Try create appeal of", index);
      const contract = new app.web3Store.web3.eth.Contract(
        app.abi,
        app.web3Store.protocolsContracts.Retriev
      );
      const max_appeals = await contract.methods.max_appeals().call();
      const n_appeals = await contract.methods.tot_appeals(index).call();
      console.log("Max appeal is;", parseInt(max_appeals));
      console.log("n appeals is:", parseInt(n_appeals));
      if (!app.isWorking && parseInt(n_appeals) < parseInt(max_appeals)) {
        app.isWorking = true;
        app.workingMessage = "Creating Appeal...";
        const active_appeal = await contract.methods
          .active_appeals(app.deal.data_uri)
          .call();
        const round = await contract.methods.getRound(active_appeal).call();
        console.log("active appeal is:", active_appeal);
        console.log("round is:", round);
        if (parseInt(round) === 99 || parseInt(round) === 0) {
          app.workingMessage = "Please confirm action with metamask..";
          try {
            const fee = await contract.methods.returnAppealFee(index).call();
            console.log("Fee needed for appeal is: " + fee);
            await contract.methods
              .createAppeal(index)
              .send({
                value: fee,
                from: app.web3Store.account,
              })
              .on("transactionHash", (tx) => {
                app.workingMessage =
                  "Found pending transaction at " +
                  tx.substr(0, 4) +
                  "..." +
                  tx.substr(-4);
                this.$toast.warning("Found pending transaction at:" + tx, {
                  position: "top-right",
                  timeout: 500000,
                  closeOnClick: true,
                  pauseOnFocusLoss: true,
                  pauseOnHover: true,
                  draggable: true,
                  draggablePercent: 0.6,
                  showCloseButtonOnHover: true,
                  hideProgressBar: true,
                  closeButton: "button",
                  icon: "mdi mdi-transfer-right",
                  rtl: false,
                });
                console.log(app.workingMessage);
              });
            app.$toast.clear();
            app.$toast("Appeal created!", {
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
            app.isWorking = false;
            app.workingMessage = "";
            setTimeout(function () {
              app.refreshDeal();
            }, 30000);
          } catch (e) {
            app.isWorking = false;
            app.workingMessage = "";
            app.$emit("alert", e.message);
          }
        } else {
          app.isWorking = false;
          app.workingMessage = "";
          app.$emit(
            "alert",
            "You can't create appeal, there's an active appeal for this URI yet."
          );
        }
      } else {
        app.isWorking = false;
        app.workingMessage = "";
        app.$emit(
          "alert",
          "You can't create appeal, max appeal for this file is reached"
        );
      }
    },
    isDeletingDeal() {
      const app = this;
      const index = app.deal.index;
      this.$buefy.dialog.confirm({
        title: "Deleting Deal #" + index,
        message:
          "Are you sure you want to <b>delete</b> this Deal? This action cannot be undone.",
        confirmText: "Delete Deal",
        type: "is-danger",
        hasIcon: true,

        onConfirm: () => app.cancelDealProposal(),
      });
    },
    async cancelDealProposal() {
      const app = this;
      const index = app.deal.index;
      if (!app.isWorking) {
        app.isWorking = true;
        this.$toast.warning("Please confirm action with metamask..", {
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
          icon: "mdi mdi-transfer-right",
          rtl: false,
        });
        console.log("cancel deal number", index);
        try {
          const contract = new app.web3Store.web3.eth.Contract(
            app.abi,
            app.web3Store.protocolsContracts.Retriev
          );
          await contract.methods
            .cancelDealProposal(index)
            .send({
              from: app.web3Store.account,
            })
            .on("transactionHash", (tx) => {
              this.$toast.warning("Found pending transaction at:" + tx, {
                position: "top-right",
                timeout: 500000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: true,
                hideProgressBar: true,
                closeButton: "button",
                icon: "mdi mdi-transfer-right",
                rtl: false,
              });
            });
          app.$toast.clear();
          app.$emit("alert", "Deal proposal canceled!");
          app.isWorking = false;
          app.refreshDeal();
        } catch (e) {
          app.isWorking = false;
          app.$emit("alert", e.message);
        }
      }
    },
    secondsToDhms(seconds) {
      seconds = Number(seconds);
      var d = Math.floor(seconds / (3600 * 24));
      var h = Math.floor((seconds % (3600 * 24)) / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = Math.floor(seconds % 60);

      var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return dDisplay + hDisplay + mDisplay + sDisplay;
    },
    secondsToD(seconds) {
      seconds = Number(seconds);
      var d = Math.floor(seconds / (3600 * 24));
      var h = Math.floor((seconds % (3600 * 24)) / 3600);
      var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";

      return dDisplay + hDisplay;
    },
    returnDate(s) {
      const date = new Date(s * 1000).toUTCString();
      return date.split("GMT")[0].trim();
    },
    async downloadFile(uri) {
      const app = this;
      app.isWorking = true;
      app.workingMessage = "Try to download your file. Please Wait...";
      console.log("try download start");
      try {
        console.log("Downloading file from:", uri);
        const downloaded = await axios.get(uri);
        console.log(downloaded);
        window.open(uri, "_blank");
        app.isWorking = false;
        app.workingMessage = "";
      } catch (e) {
        console.log("RETRIEVE_ERROR", e);
        app.$emit("alert", "Can't retrieve file!");
        app.isWorking = false;
        app.workingMessage = "";
      }
    },
  },
};
</script>
