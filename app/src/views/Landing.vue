<template>
  <div class="landing" style="overflow-y: scroll !important">
    <!-- Header -->

    <div class="header">
      <div v-if="isDesktop" class="main-img bg-desktop"></div>
      <div v-if="isTablet" class="main-img bg-tablet"></div>
      <div v-if="isMobile" class="main-img bg-mobile"></div>
      <div class="row justify-content-center">
        <div class="col-12 col-md-12 col-lg-12">
          <div
            class="text-center"
            style="position: relative; z-index: 3"
            :class="{ 'px-4': isMobile }"
          >
            <h6 style="text-transform: uppercase">
              say hello to onchain.storage
            </h6>
            <h1 class="mt-4">
              The gateway <br v-if="!isDesktop" />
              to your <br />
              on-chain data
            </h1>
            <p class="mt-4">
              Discover an ecosystem of composable <br v-if="isMobile" />
              protocols<br v-if="!isMobile" />
              to store data <br v-if="isMobile" />
              via one blockchain interaction
            </p>
            <div>
              <div v-if="!isMobile" class="btn-transparent disabled mt-5">
                Start to store
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid p-0 mt-5">
      <Navbar />
      <div class="gap-1"></div>
      <div class="container" :class="{ 'px-5': isMobile }">
        <!-- First Section -->
        <div class="row" :class="{ 'row align-items-end': isTablet }">
          <div class="col-12 col-md-12 col-lg-4">
            <div :class="{ 'row justify-content-center': isTablet }">
              <div :class="{ 'col-8': isTablet }">
                <h6 style="text-transform: uppercase">
                  what is onchain.storage
                </h6>
                <h4 class="mt-4">Programmable storage, for everyone</h4>
                <p class="mt-5">
                  Onchain.storage is community-run open source project that
                  collects storage protocols and primitives and offers a single
                  interface to use those: storing data via on-chain interaction
                  made.
                </p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-12 col-lg-8" :class="{ 'mt-5': isMobile }">
            <div :class="{ 'card-img-h mx-auto mt-5': isTablet }">
              <img src="../assets/img/landing/img1.png" alt="" />
            </div>
          </div>
        </div>
        <!-- Second Section -->
        <div v-if="isDesktop" class="gap-2"></div>
        <div v-if="!isDesktop" class="gap-1"></div>
        <div class="row b-dashed">
          <div
            class="col-12 col-md-12 col-lg-7 order-1 order-md-1 order-lg-2 p-5"
          >
            <div class="row justify-content-center align-items-center">
              <div
                class="col-12 col-md-9 col-lg-9"
                :class="{ 'py-5': isDesktop, 'pt-5': isTablet }"
              >
                <h6 style="text-transform: uppercase">storage goes web3</h6>
                <h4 class="mt-4">How do you store via the chain?</h4>
                <p class="mt-5">
                  Decentralized data storage solutions are made accessible
                  directly via smart contracts instead of traditional web2 apis:
                  explore tools to browse what DAOs and wallets are storing.
                </p>
              </div>
            </div>
          </div>
          <div
            class="col-12 col-md-12 col-lg-5 order-2 order-md-2 order-lg-1 px-5 pb-5 d-flex justify-content-center aling-items-center"
            :class="{ 'b-dashed-right pt-5': isDesktop }"
          >
            <div class="card-img" :class="{ 'pb-5': isTablet }">
              <img src="../assets/img/landing/img2.png" alt="" />
            </div>
          </div>
        </div>
        <div v-if="isDesktop" class="gap-2"></div>
        <div v-if="!isDesktop" class="gap-1"></div>
        <!-- Third Section -->
        <div class="row justify-content-center">
          <div class="col-12 col-md-10 col-lg-6 text-center">
            <h6 style="text-transform: uppercase">all in one</h6>
            <h4 class="mt-4">One deal, many protocols</h4>
            <p class="mt-5 mb-5 pb-4">
              Learn how to back your favorite data and how much is already at
              stake to preserve it: oracles, providers and crypto-economic
              incentives in one self-contained deal maker tool.
            </p>
            <div class="card-img-h m-auto">
              <img src="../assets/img/landing/img3.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div class="gap-1"></div>
      <!-- Call to action section -->
      <div
        class="card-rect bg-theme-colored on-background p-5"
        :class="{ 'bg-light-desktop': isDesktop }"
      >
        <div class="container-fluid text-center p-0">
          <div class="row justify-content-center">
            <div class="col-12 col-md-12 col-lg-8">
              <h4 class="color-light">
                Stay up to date on future <br v-if="!isMobile" />
                developments
              </h4>
              <a
                href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
                class="btn-light mt-5"
                target="_blank"
                >Join Slack</a
              >
            </div>
          </div>
        </div>
      </div>
      <!-- Last section-card -->
    </div>

    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Navbar from "@/components/landing/Navbar.vue";
import Footer from "@/components/landing/Footer.vue";
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "landing",
  mixins: [checkViewport],
  components: {
    Navbar,
    Footer,
  },

  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_KEY,
      network: process.env.VUE_APP_NETWORK,
    };
  },
  methods: {
    goToApp() {
      window.location = "/#/app";
      location.reload();
    },
  },
};
</script>
