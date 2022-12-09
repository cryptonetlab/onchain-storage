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
          <span> WEB3 BOUNTY</span>
        </div>
      </div>

      <!-- Deal action bar -->
      <div class="is-flex is-align-items-center is-flex-wrap-wrap">
        <!-- BADGES -->
        <div>
          <!-- active badge -->
          <div v-if="deal.status_active" class="badge badge-success">
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
            v-if="!isOpen"
            class="mdi mdi-chevron-right"
            aria-hidden="true"
          ></i>
          <i v-if="isOpen" class="mdi mdi-chevron-down" aria-hidden="true"></i>
        </div>
      </div>
      <!-- Deal action bar -->
    </div>

    <!-- DEAL SPECIFICATIONS -->
    <Transition name="slide">
      <div class="" v-show="isOpen">
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
                  <p>Data URI:</p>
                  <a
                    style="word-wrap: break-word"
                    class="link-primary break-word"
                    :href="
                      'https://w3-b.link/ipfs/' +
                      deal.data_uri.replace('ipfs://', '')
                    "
                    target="_blank"
                    >{{ deal.data_uri }}</a
                  >
                </div>
              </div>
            </div>
            <p class="pl-4 mt-5 mb-2">Deal details</p>
            <div
              class="custom-card border-primary-lighter is-flex is-flex-direction-column"
            >
              <div
                class="is-flex is-align-items-center is-justify-content-space-between p-3"
              >
                <p>Provider:</p>

                <p>
                  <b>
                    <span>
                      {{ web3Store.protocolsContracts.Web3Bounty }}</span
                    ></b
                  >
                </p>
              </div>
              <div class="divider"></div>
              <div
                class="is-flex is-align-items-center is-justify-content-space-between p-3"
              >
                <p>Value:</p>
                <b>Free</b>
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
            <div
              class="is-flex is-align-items-center is-justify-content-end mt-4"
            >
              <div class="has-text-right">
                <!-- <a
                  href="https://web3bounty.app/#/"
                  target="_blank"
                  class="btn-light ml-3"
                  style="text-decoration: none"
                >
                  Go to Web3 Bounty
                </a> -->
                <b-button
                  v-if="deal.pending !== undefined && deal.pending"
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

import checkViewport from "@/mixins/checkViewport";
import axios from "axios";
const abi = require("./abi.json");
export default {
  name: "Deal",
  mixins: [checkViewport],
  props: ["storedDeal", "index"],
  data() {
    return {
      abi: abi,
      openTimingDeal: false,
      download: false,
      isOpen: false,
      isWorking: false,
      deal: {},
      dealProviders: [],
      appealFee: 0,
    };
  },
  async mounted() {
    const app = this;
    app.deal = app.storedDeal;
    if (app.deal.appeal === undefined) {
      app.deal.appeal = {};
    }
  },
  computed: {
    ...mapStores(useWeb3Store),
  },

  methods: {
    async toggleDeal() {
      const app = this;
      app.download = false;
      const uri =
        app.web3Store.protocolsEndpoint.Web3Bounty +
        "/" +
        app.deal.data_uri.replace("ipfs://", "ipfs/");
      try {
        console.log("Downloading file from:", uri);
        const downloaded = await axios.get(uri);
        if (downloaded.data !== undefined) {
          // app.download[app.deal.data_uri] = true;
          app.download = true;
          console.log("download became", app.download);
        }
      } catch (e) {
        console.log("Error while downloading from:", uri);
      }
      // Fething appeal fee
      try {
        console.log("starting fetching appelFee");
        const contract = new app.web3Store.web3.eth.Contract(
          app.abi,
          app.web3Store.protocolsContracts.Web3Bounty
        );
        const appeal_fee = await contract.methods
          .returnAppealFee(app.deal.index)
          .call();
        app.appealFee = appeal_fee;
        console.log("Appeal Fee is:", app.appeal_fee);
      } catch (e) {
        console.log("Error while calculating appel fee");
      }
      app.isOpen = !app.isOpen;
      console.log("Opening deal", app.isOpen);
      app.refreshDeal();
    },
    async refreshDeal() {
      const app = this;
      console.log("Refreshing deal", app.deal);
      if (!app.isWorking && app.isOpen) {
        app.$buefy.toast.open({
          duration: 50000,
          message:
            '<i class="mdi mdi-timer-sand-complete"></i> ' +
            ` Deal ID #` +
            app.deal.index +
            ` information is refreshing...`,
          position: "is-bottom-right",
          type: "is-warning",
        });
        try {
          let refreshed = await axios.get(
            app.web3Store.protocolsContracts.Web3Bounty +
              "/parse/" +
              app.deal.index
          );
          console.log("refreshed", refreshed.data);
          app.deal = refreshed.data;

          // PERSER DEAL
          //Check STATUS ACTIVE Deal

          if (parseInt(app.deal.timestamp_start) > 0) {
            app.deal.status_active = true;
          } else {
            app.deal.status_active = false;
          }

          // Check Pending Deal
          if (
            app.deal.timestamp_start !== undefined &&
            parseInt(app.deal.timestamp_start) === 0 &&
            !app.deal.canceled
          ) {
            app.deal.pending = true;
          } else {
            app.deal.pending = false;
          }

          // END PARSER DEAL
          app.$toast.clear();
          this.$buefy.toast.open({
            duration: 5000,
            message:
              `<i class="mdi mdi-file-check-outline"></i>` +
              ` Deal ID #` +
              app.deal.index +
              ` information refreshed`,
            position: "is-bottom-right",
            type: "is-warning",
          });
          app.$forceUpdate();
        } catch (e) {
          app.$emit("alert", e.message);
        }
      } else {
        console.log("Working, please wait..");
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
          timeout: 2000,
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
            app.web3Store.protocolsContracts.Web3Bounty,
            {
              gasLimit: "5000000",
            }
          );
          app.$toast.clear();
          await contract.methods
            .cancelDealProposal(index)
            .send({
              from: app.account,
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
          app.$emit("alert", "Deal proposal canceled!");
          app.$toast.clear();
          app.isWorking = false;
          app.$emit("loadState");
        } catch (e) {
          app.isWorking = false;
          app.$toast.clear();
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
