<template>
  <div class="full bg-primary-color-contrast">
    <Navbar :navSpec="navSpec" @toggleSpec="toggleSpec()" />
    <!-- MOBILE BLOCKER DAPP -->
    <MobileBlocker />
    <!-- END MOBILE BLOCKER DAPP -->
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
        class="column m-0 py-6"
        :class="{
          'is-8-desktop is-8-widescreen': utilsStore.showSidebar,
          'is-8-tablet is-9-desktop is-9-widescreen': !utilsStore.showSidebar,
          'px-6': isDesktop,
        }"
        style="position: relative; overflow-y: auto"
      >
        <div class="gradient-box"></div>

        <!-- LOADER -->
        <div
          v-if="
            (web3Store.connected && web3Store.isLoadingState) ||
            userStore.loadingUserInfo
          "
          class="container py-5"
          :class="{ 'px-5': isDesktop }"
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
            web3Store.connected &&
            !web3Store.isLoadingState &&
            !userStore.loadingUserInfo
          "
          class="container py-5"
          :class="{ 'px-5': isDesktop }"
        >
          <User />
          <Transition enter-active-class="fade-in-top">
            <!-- CIDs List and Filters -->

            <div
              v-if="
                userStore.deals !== undefined &&
                userStore.deals !== 'error-api' &&
                userStore.deals !== undefined &&
                userStore.deals.active > 0
              "
            >
              <div>
                <h2 class="mt-6 mb-3">Active protocols</h2>
                <ProtocolsList :deals="userStore.deals" />
              </div>
              <h2 class="mt-6 mb-3">CIDs list</h2>
              <CIDFilters />
              <div
                class="is-flex is-align-items-center is-justify-content-space-between mt-3 mb-3 px-5"
              >
                <div class="is-flex is-align-items-center">
                  <p style="width: 13rem">CID</p>
                  <div
                    v-if="isDesktop"
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

              <div
                v-if="userStore.deals !== undefined"
                class="custom-card border-primary-lighter"
              >
                <div
                  v-for="(details, index) in userStore.deals.list"
                  :key="index"
                >
                  <SingleCID :details="details" :cid="index" />
                </div>
              </div>
            </div>
            <!-- END CIDs list and filters -->

            <!-- API Error -->
            <div
              v-if="
                userStore.deals !== undefined && userStore.deals === 'error-api'
              "
            >
              <div
                class="custom-card border-primary-lighter has-text-centered mt-5 py-4"
              >
                <img
                  width="68"
                  class="mt-3"
                  src="../assets/img/icon2.svg"
                  alt=""
                />
                <h4 class="mt-4">Ops.. There was an error</h4>
                <div class="mt-2">
                  <p>
                    Impossible to fetch informations, please come back later!
                  </p>
                </div>
                <a
                  style="text-decoration: none"
                  href="/"
                  class="btn-light mt-4 mb-3"
                  @click="web3Store.connect()"
                >
                  Go to Website
                </a>
              </div>
            </div>
            <!-- END API Error -->
          </Transition>
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
import { useUserStore } from "@/stores/userStore";

import checkViewport from "@/mixins/checkViewport";

import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import MobileBlocker from "@/components/elements/MobileBlocker.vue";
import Connect from "@/components/Connect.vue";
import User from "@/components/User.vue";
import ProtocolsList from "@/components/ProtocolsList.vue";
import FastCreate from "@/components/fast-create/FastCreate.vue";
import SingleCID from "@/components/cids/SingleCID.vue";
import CIDFilters from "@/components/cids/CIDFilters.vue";
import IcoChevronRight from "@/components/elements/IcoChevronRight.vue";

export default {
  name: "dashboard",
  mixins: [checkViewport],
  components: {
    Navbar,
    User,
    ProtocolsList,
    Connect,
    Sidebar,
    FastCreate,
    CIDFilters,
    SingleCID,
    MobileBlocker,
    IcoChevronRight,
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
    ...mapStores(useUserStore),
  },

  data() {
    return {
      isWorking: false,
      //layout
      navSpec: false,
      orderAsc: false,
    };
  },
  mounted() {
    const app = this;
    if (app.web3Store.account) {
      app.userStore.fetchDeals(
        app.web3Store.selectedContract,
        app.web3Store.account,
        app.web3Store.web3
      );
    } else {
      const unsubscribe = app.web3Store.$onAction(({ name, store, after }) => {
        after(async () => {
          if (name === "connect" || name === "switchNetwork") {
            if (store.web3) {
              app.userStore.fetchDeals(
                app.web3Store.selectedContract,
                app.web3Store.account,
                app.web3Store.web3
              );
              unsubscribe();
            }
          }
        });
      });
    }

    this.checkTabletViewport();
  },
  watch: {
    isTablet() {
      this.checkTabletViewport();
    },
  },
  methods: {
    checkTabletViewport() {
      const app = this;
      if (app.isTablet) {
        app.utilsStore.showSidebar = false;
      } else {
        app.utilsStore.showSidebar = true;
      }
    },
  },
};
</script>
