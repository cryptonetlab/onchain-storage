<template>
  <div class="full bg-primary-color-contrast">
    <Navbar :navSpec="navSpec" @toggleSpec="toggleSpec()" />
    <MobileBlocker />
    <div
      class="columns is-mobile m-0 px-0 pb-0"
      v-if="!isMobile"
      style="height: 100%; padding-top: 70px"
    >
      <!-- SIDEBAR SECTION -->
      <div
        style="transition: all 0.25s"
        class="column p-0"
        :class="{
          'is-1': !utilsStore.showSidebar,
          'is-2-tablet is-2-desktop is-2-widescreen': utilsStore.showSidebar,
        }"
      >
        <Sidebar id="sidebar" />
      </div>
      <!--END SIDEBAR SECTION -->

      <div
        class="column m-0 px-6 pt-4"
        :class="{
          'is-8-desktop is-8-widescreen': utilsStore.showSidebar,
          'is-8-tablet is-9-desktop is-9-widescreen': !utilsStore.showSidebar,
        }"
        style="position: relative; overflow-y: auto"
      >
        <div class="gradient-box"></div>

        <!-- LOADER -->
        <div
          v-if="web3Store.isLoadingState || isLoadingCID"
          class="container px-5 py-5"
        >
          <div
            class="loading_box mb-5"
            style="width: 100%; height: 249px"
          ></div>
          <div class="loading_box" style="width: 100px; height: 35px"></div>
          <div class="is-flex align-items-center mt-3 mb-4">
            <div
              class="loading_box mr-2"
              style="width: 80px; height: 30px"
            ></div>
            <div
              class="loading_box mr-2"
              style="width: 110px; height: 30px"
            ></div>
            <div class="loading_box" style="width: 65px; height: 30px"></div>
          </div>
          <div v-for="i in 4" :key="i" class="card-header-title p-0 mt-2">
            <div class="loading_box" style="width: 100%; height: 50px"></div>
          </div>
        </div>
        <!-- END LOADER -->

        <div
          v-if="
            web3Store.connected && !web3Store.isLoadingState && !isLoadingCID
          "
          class="container px-5 py-4 mt-2"
        >
          <!-- CID SPECS -->
          <div class="is-flex is-align-items-center">
            <!-- <v-gravatar
              class="mr-4"
              :email="web3Store.account"
              :size="220"
              style="border-radius: 12px"
            /> -->
            <div
              class="custom-user-card border-excludeAutoConnectprimary-lighter is-flex is-flex-direction-column is-justify-content-space-between"
              style="width: 100%; height: 220px"
            >
              <div class="p-4">
                <div
                  class="is-flex is-align-items-start is-justify-content-space-between"
                >
                  <p class="small">CID</p>
                  <a
                    :href="'https://ipfs.io/ipfs/' + $route.params.id"
                    target="_blank"
                    class="btn-lighter p-1"
                    style="text-decoration: none"
                    ><i class="mdi mdi-eye" style="font-size: 1.5rem"></i
                  ></a>
                </div>

                <div class="is-flex is-align-items-center">
                  <h3 class="m-0" style="font-weight: 700">
                    {{
                      $route.params.id.substr(0, 4) +
                      "....." +
                      $route.params.id.substr(-4)
                    }}
                  </h3>
                  <div class="pointer ml-4" @click="copyToClipboard()">
                    <IcoCopy />
                  </div>
                </div>
              </div>

              <div class="columns p-0 m-0 b-top-light">
                <div class="column is-half p-0 m-0">
                  <!-- TODO: Make it Dynamic -->
                  <div class="p-3">
                    <h5>Total Value</h5>
                    <h2 class="mt-3">
                      {{ totalValue }}
                      <span v-if="parseInt(web3Store.network) === 137"
                        >MATIC</span
                      >
                      <span v-if="parseInt(web3Store.network) === 5">gETH</span>
                    </h2>
                  </div>
                </div>
                <div class="column is-half b-left-light p-0 m-0">
                  <div class="p-3">
                    <h5>Active Deals</h5>
                    <div class="is-flex is-align-items-flex-end mt-3">
                      <h2 class="m-0">{{ cid.active }}</h2>
                      <p v-if="cid.protocols" class="ml-2">
                        / on
                        {{ cid.protocols.length }}
                        protocols
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="mt-5 mb-3">Active protocols</h2>
            <ProtocolsList :deals="cid" />
          </div>
          <!-- END CID SPECS -->
          <!-- <div class="mt-5 mb-5">
            <h2 class="mb-3">Overview</h2>
            <div class="custom-card border-primary-lighter p-4">
              <BarChart :cid="cid" />
            </div>
          </div> -->

          <!-- DEAL LIST -->
          <div>
            <h2 class="mt-5 mb-4">Deal list</h2>
            <DealFilters />
            <div
              class="is-flex is-align-items-center is-justify-content-space-between mt-3 mb-3 px-4"
            >
              <div class="is-flex is-align-items-center">
                <p style="width: 10.3rem">User</p>
                <div v-if="isDesktop"
                  class="is-flex is-align-items-center"
                  @click="orderAsc = !orderAsc"
                >
                  <p class="mr-3"><b>Expire Date</b></p>
                  <IcoChevronRight
                    :style="[
                      orderAsc ? { rotate: '90deg' } : { rotate: '272deg' },
                    ]"
                  />
                </div>
              </div>

              <p style="margin-right: 3.3rem !important">Protocol(s)</p>
            </div>
            <div class="custom-card border-primary-lighter mt-2">
              <div v-for="(user, index) in cid.deals" :key="index">
                <SingleUser
                  :deals="user"
                  :user="index"
                  :protocols="protocols"
                />
              </div>
            </div>
          </div>
          <!-- END DEAL LIST -->
        </div>
        <Connect />
      </div>

      <!-- FAST CREATION DEAL -->
      <div
        class="column p-0 m-0"
        :class="{ 'is-2': isDesktop, 'is-3': isTablet }"
      >
        <FastCreate />
      </div>
      <!-- END | FAST CREATION DEAL -->
    </div>
  </div>
</template>
<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";

import checkViewport from "@/mixins/checkViewport";

import axios from "axios";
import Navbar from "@/components/Navbar.vue";
import User from "@/components/User.vue";

import Sidebar from "@/components/Sidebar.vue";
import FastCreate from "@/components/fast-create/FastCreate.vue";
import MobileBlocker from "@/components/elements/MobileBlocker.vue";
import ProtocolsList from "@/components/ProtocolsList.vue";
import DealFilters from "@/components/cids/DealFilters.vue";
import SingleUser from "@/components/cids/SingleUser.vue";
import Connect from "@/components/Connect.vue";
import IcoCopy from "@/components/elements/IcoCopy.vue";
import IcoChevronRight from "@/components/elements/IcoChevronRight.vue";
// import BarChart from "@/components/cids/BarChart.vue";

export default {
  name: "cid-specs",
  mixins: [checkViewport],
  components: {
    Navbar,
    User,
    // BarChart,
    Sidebar,
    MobileBlocker,
    FastCreate,
    Connect,
    DealFilters,
    SingleUser,
    IcoCopy,
    IcoChevronRight,
    ProtocolsList,
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },

  data() {
    return {
      cid: {},
      api: process.env.VUE_APP_API_ONCHAINSTORAGE,
      protocols: [],
      totalValue: 0,
      //layout
      navSpec: false,
      orderAsc: false,
      isLoadingCID: false,
      parsedSize: "",
    };
  },
  mounted() {
    const app = this;
    if (!app.isLoadingCID) {
      if (app.web3Store.web3) {
        app.isLoadingCID = true;
        app.fetchCIDInfo();
      } else {
        const unsubscribe = app.web3Store.$onAction(
          ({ name, store, after }) => {
            after(async () => {
              if (name === "connect" || name === "switchNetwork") {
                if (store.web3) {
                  app.isLoadingCID = true;
                  app.fetchCIDInfo();
                  unsubscribe();
                }
              }
            });
          }
        );
      }
    }
    app.checkTabletViewport();
  },
  watch: {
    isTablet() {
      this.checkTabletViewport();
    },
  },
  methods: {
    async fetchCIDInfo() {
      const app = this;
      app.isLoadingCID = true;
      let cidAddress = app.$route.params.id;
      try {
        const cid = await axios.get(
          app.api +
            "/metadata/" +
            app.web3Store.selectedContract +
            "/" +
            cidAddress
        );
        app.cid = cid.data;
        console.log("THIS IS CID", app.cid);
        app.totalValue = parseFloat(
          app.web3Store.web3.utils.fromWei(app.cid.value.toString(), "ether")
        ).toFixed(10);
        app.protocols = app.cid.protocols;
        if (parseFloat(app.cid.metadata.size / 1000000).toFixed(1) > 0.5) {
          app.parsedSize =
            parseFloat(app.cid.metadata.size / 1000000).toFixed(3) + " MB";
        } else {
          app.parsedSize =
            parseFloat(app.cid.metadata.size / 1000).toFixed(3) + " KB";
        }
        app.isLoadingCID = false;
      } catch (e) {
        alert("Api error, please retry");
        app.isLoadingCID = false;
      }
    },
    checkTabletViewport() {
      const app = this;
      if (app.isTablet) {
        app.utilsStore.showSidebar = false;
      }
    },
    copyToClipboard() {
      const app = this;
      if (app.$route.params.id) {
        let copyText = app.$route.params.id;
        navigator.clipboard.writeText(copyText).then(() => {
          // Alert the user that the action took place.
          // Nobody likes hidden stuff being done under the hood!
          console.log("Copied to Clipboard");
        });
      } else {
        console.log("Nothing to copy, make sure that you're connected!");
      }
    },
  },
};
</script>
