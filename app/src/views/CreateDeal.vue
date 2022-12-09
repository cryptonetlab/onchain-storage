<template>
  <div class="full bg-primary-color-contrast">
    <Navbar
      :loading="loading"
      :navSpec="navSpec"
      @toggleSpec="toggleSpec()"
      @loadState="loadState()"
    />
    <!-- MOBILE BLOCKER DAPP -->
    <MobileBlocker />
    <!-- END MOBILE BLOCKER DAPP -->

    <div
      class="columns m-0 px-0 pb-0"
      v-if="!isMobile"
      style="height: 100%; padding-top: 70px"
    >
      <!-- SIDEBAR SECTION -->
      <div
        style="transition: all 0.25s"
        class="column p-0"
        :class="{
          'is-1': !utilsStore.showSidebar,
          'is-2': utilsStore.showSidebar,
        }"
      >
        <Sidebar id="sidebar" />
      </div>
      <!--END SIDEBAR SECTION -->

      <div
        class="column p-0 m-0"
        style="position: relative; transition: all 0.25s"
      >
        <div class="gradient-box"></div>
        <!-- SHOW CREATION DEAL -->
        <div
          v-if="web3Store.connected"
          class="columns m-0 p-0"
          style="transition: all 0.25s; overflow-y: auto; height: 100%"
        >
          <div
            class="column p-0 m-0"
            :class="{
              'is-12': !service,
              'is-9': service,
            }"
          >
            <div class="px-6 py-4">
              <div>
                <div v-if="step === 3">
                  <!-- FILTERS PROVIDERS -->
                  <FilterProvider :step="step" />
                </div>

                <!-- CREATION DEAL STEPS -->
                <div>
                  <!-- Upload file -->
                  <h2 class="mb-2" style="position: relative; z-index: 2">
                    1. Upload your file
                  </h2>
                  <div class="columns">
                    <div class="column is-half">
                      <UploadFile
                        v-if="step < 2"
                        :step="step"
                        :fileToUpload="fileToUpload"
                        @check-file="checkFileUpload($event)"
                        @remove-file="removeFile()"
                        @alert="alertCustomError($event)"
                      />
                    </div>
                  </div>

                  <!-- Select Protocol -->
                  <SelectProtocol
                    v-if="dealUri"
                    :step="step"
                    :service="service"
                    :dealUri="dealUri"
                    @checkService="checkService($event)"
                  />

                  <!-- Retrieval Pinning Protocol -->
                  <div v-if="service === 'retrieval_pinning'">
                    <RetrievNewDeal
                      :dealUri="dealUri"
                      :fileSize="fileSize"
                      :fileToUpload="fileToUpload"
                      @alert="alertCustomError($event)"
                    />
                  </div>
                  <!-- END | Retrieval Pinning Protocol -->

                  <!-- Web3Bounty Protocol -->
                  <div v-if="service === 'web3bounty'">
                    <Web3BountyNewDeal
                      :dealUri="dealUri"
                      :fileToUpload="fileToUpload"
                      :fileSize="fileSize"
                      @alert="alertCustomError($event)"
                    />
                  </div>
                  <!-- END | Web3Bounty Protocol -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <Connect />
        <!-- END - SHOW CREATION DEAL -->
      </div>

      <!-- END | NAVBAR SECTION -->
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "../stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";

import checkViewport from "@/mixins/checkViewport";

import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import UploadFile from "@/components/UploadFile.vue";
import SelectProtocol from "@/components/SelectProtocol.vue";
import FilterProvider from "@/components/retrieval-pinning/sub/FilterProvider.vue";
import MobileBlocker from "@/components/elements/MobileBlocker.vue";
import Connect from "@/components/Connect.vue";

// Importing Protocol's deals
import RetrievNewDeal from "@/components/retrieval-pinning/RetrievNewDeal.vue";
import Web3BountyNewDeal from "@/components/web3-storage/Web3BountyNewDeal.vue";

const CONFIG = require("../config.json");
export default {
  name: "create-deal",
  mixins: [checkViewport],
  components: {
    Navbar,
    Sidebar,
    MobileBlocker,
    Connect,
    UploadFile,
    SelectProtocol,
    Web3BountyNewDeal,
    RetrievNewDeal,
    FilterProvider,
  },
  data() {
    return {
      loading: true,
      isToasting: false,
      service: "",
      workingMessage: "",
      fileSize: 0,
      dealUri: "",
      fileToUpload: {},

      // REFRESH SINGLE DEAL
      selectedDeal: {},

      // FOR LAYOUT
      navSpec: false,
      step: 0,
      showDetails: false,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },
  mounted() {},
  methods: {
    // ========================================> UPLOADING FILE FUNCTIONS <========================================
    checkFileUpload({ isFile, isURI }) {
      const app = this;
      app.fileToUpload = isFile;
      app.dealUri = isURI;

      console.log("pass FILE from child", app.fileToUpload);
      console.log("pass DEAL URI from child", app.dealUri);

      app.fileSize = app.fileToUpload.size;
    },

    removeFile() {
      const app = this;
      app.fileToUpload = {};
      app.dealUri = "";
      app.fileSize = 0;
      app.service = "";
    },

    // ========================================> SELECT PROTOCOL <========================================
    checkService(service) {
      const app = this;
      app.service = service;
      console.log("pass PROTOCOL from child", app.service);
    },

    // ========================================> NOTIFICATIONS & ALERTS <========================================
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

    // ========================================> NAVIGATION <========================================
    toggleSpec() {
      const app = this;
      app.navSpec = !app.navSpec;
    },
  },
};
</script>
