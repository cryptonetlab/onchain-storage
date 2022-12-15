<template>
  <div
    v-if="!isMobile"
    id="myNav"
    class="custom-navbar bg-primary-color-contrast b-bottom-colored-grey"
  >
    <!-- ============================== HEADER ============================== -->
    <div class="px-5">
      <div
        class="is-flex is-align-items-center is-justify-content-space-between"
      >
        <div class="is-flex is-align-items-center">
          <!-- Navbar Brand -->
          <div class="">
            <a href="/#/app/">
              <div class="is-flex is-align-items-center">
                <img width="39px" src="../assets/img/logo.svg" alt="" /></div
            ></a>
          </div>
          <!-- END | Navbar Brand -->

          <!-- ============================== Searcher ============================== -->
          <div
            class="field ml-5 mb-0"
            :style="[
              isDesktop
                ? { position: 'relative', width: '517px' }
                : { position: 'relative', width: 'auto' },
            ]"
          >
            <div class="control has-icons-left has-icons-right">
              <input
                class="input is-info"
                type="text"
                placeholder="Search by CID, protocol or user"
                v-model="searcher"
              />
              <!-- TODO: IMPORTANT add ==>  v-on:keyup.enter="search()" on search input -->
              <span class="icon is-small is-left">
                <i class="mdi mdi-magnify"></i>
              </span>
            </div>
            <div
              v-if="searcher !== undefined && searcher.length !== 0"
              class="placeholder-input-search"
            >
              <i
                class="mdi mdi-close-circle pointer"
                @click="resetSearch()"
              ></i>
            </div>
          </div>
          <!-- ============================== END Searcher ============================== -->
        </div>

        <div class="">
          <!-- LOADER ACCOUNT INFO -->
          <div
            v-if="web3Store.isLoadingState"
            class="is-flex is-align-items-center is-justify-content-flex-end"
          >
            <div
              class="loading_box mr-4"
              style="width: 200px; height: 47px"
            ></div>
            <div
              class="loading_box mr-4"
              style="width: 137px; height: 47px"
            ></div>
            <div class="loading_box" style="width: 57px; height: 47px"></div>
          </div>
          <!-- END | LOADER ACCOUNT INFO -->
          <div
            class="is-flex is-align-items-center"
            :class="{ 'is-justify-content-flex-end': !isMobile }"
          >
            <!-- Disconnect button -->
            <div
              v-if="
                $route.name !== 'wallet-specs' &&
                web3Store.account &&
                !web3Store.isLoadingState
              "
              class="btn-icon-transparent"
              @click="web3Store.disconnect()"
              :style="[
                web3Store.connected
                  ? { backgroundColor: '#E3EBFF', borderColor: '#0042ec' }
                  : { backgroundColor: '#d7d7d7', borderColor: '#6d6d6d' },
              ]"
            >
              <IcoDisconnect
                :class="{ 'ico-disconnected': !web3Store.connected }"
              />
            </div>
            <!-- END disconnect button -->

            <!-- Profile Details -->
            <a
              href="/#/app"
              style="text-decoration: none"
              v-if="web3Store.account && !web3Store.isLoadingState"
              class="btn-account is-flex is-align-items-center mr-4"
              :style="[
                web3Store.connected
                  ? { backgroundColor: '#E3EBFF' }
                  : { backgroundColor: '#d7d7d7' },
              ]"
            >
              <v-gravatar
                v-if="web3Store.connected"
                class="gravatar-nav"
                :email="web3Store.account"
                :size="30"
              />
              <p
                :class="{
                  'py-2': !web3Store.connected,
                  'ml-3': web3Store.connected,
                }"
              >
                <b
                  :style="[
                    web3Store.connected
                      ? { color: '#0042ec' }
                      : { color: '#6d6d6d' },
                  ]"
                >
                  <span
                    v-if="
                      web3Store.ensAccount !== undefined &&
                      web3Store.ensAccount !== ''
                    "
                    >{{ web3Store.ensAccount }}</span
                  >
                  <span v-if="!web3Store.ensAccount">
                    {{
                      web3Store.account.substr(0, 6) +
                      "..." +
                      web3Store.account.substr(-6)
                    }}</span
                  ></b
                >
              </p>
            </a>
            <!-- End Profile Details -->

            <!-- Select Blockchain contract -->
            <div
              v-if="!web3Store.isLoadingState && web3Store.connected"
              class="custom_dropdown-2 mr-1"
            >
              <div
                class="custom_dropdown__face"
                :style="[
                  openSelect
                    ? {
                        borderBottom: 'none',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                      }
                    : { top: '0px' },
                ]"
                @click="openSelect = !openSelect"
              >
                <div
                  class="custom_dropdown__text is-flex is-align-items-center"
                >
                  <div
                    class="is-flex is-align-items-center"
                    v-if="web3Store.selectedContract === 'goerli'"
                  >
                    <IcoEth />
                    <b class="ml-2"> Goerli</b>
                  </div>

                  <div
                    class="is-flex is-align-items-center"
                    v-if="parseInt(web3Store.network) === 1"
                  >
                    <IcoEth />
                    <b class="ml-2"> Ethereum</b>
                  </div>
                  <div
                    class="is-flex is-align-items-center"
                    v-if="web3Store.selectedContract === 'polygon'"
                  >
                    <IcoPolygon /> <b class="ml-2"> Polygon</b>
                  </div>
                  <IcoChevronRight
                    class="ml-2"
                    :style="[
                      openSelect ? { rotate: '90deg' } : { rotate: '0deg' },
                    ]"
                  />
                </div>
              </div>
              <Transition
                enter-active-class="fade-in-top"
                leave-active-class="fade-out-top"
              >
                <ul
                  style="z-index: 999"
                  v-if="openSelect"
                  class="custom_dropdown__items"
                >
                  <li
                    @click="web3Store.switchContract(net)"
                    v-for="net in web3Store.networks"
                    :value="net"
                    :key="net"
                    class="is-flex is-align-items-center"
                  >
                    <div class="mr-2">
                      <IcoEth v-if="net === 'goerli'" /><IcoPolygon
                        v-if="net === 'polygon'"
                      />
                    </div>
                    <span style="font-size: 13px; font-weight: 600">
                      {{ net }}</span
                    >
                  </li>
                </ul>
              </Transition>
            </div>
            <!-- END | Select Blockchain contract -->

            <!-- Fee Network Data -->
            <div
              v-if="
                web3Store.feeData !== undefined &&
                web3Store.feeData.length !== 0 &&
                !web3Store.isLoadingState &&
                web3Store.account &&
                web3Store.connected
              "
              class="is-flex is-align-items-center me-10-desktop"
            >
              <i
                class="mdi mdi-gas-station-outline mr-2"
                style="font-size: 2rem"
              ></i>
              <p>
                <b>{{ parseFloat(web3Store.feeData).toFixed(0) }}</b>
              </p>
            </div>
            <!-- END | Fee Network Data -->
          </div>
        </div>
      </div>
    </div>
    <!-- ============================== END  HEADER ============================== -->

    <!-- ============================== REFEREE SPECIFICATION ============================== -->
    <Transition
      enter-active-class="slide-in-right"
      leave-active-class="slide-out-right"
    >
      <div
        v-if="navSpec"
        @mouseleave="$emit('toggleSpec')"
        class="referee-right-col"
      >
        <div class="referee-container px-5">
          <!-- <div class="referee-icon">
                        </div> -->
          <div class="mt-5">
            <h3>Referee Net #1</h3>
            <div class="mt-6">
              <h5 class="pb-2 b-bottom-colored-dark">
                Referee IDs
                <i class="fa-solid fa-wallet ml-3"></i>
              </h5>

              <div v-if="referees !== undefined && referees.length > 0">
                <a
                  class="hover-underline"
                  style="display: block"
                  :href="'https://rinkeby.etherscan.io/address/' + referee"
                  target="_blank"
                  v-for="referee in referees"
                  :key="referee.index"
                >
                  {{ referee.substr(0, 4) + "..." + referee.substr(-4) }}
                </a>
              </div>
            </div>
          </div>
          <div class="mt-5">
            <h5 class="pb-2 b-bottom-colored-dark">
              TERMS OF AGREEMENT
              <i class="fa-solid fa-file-lines ml-2"></i>
            </h5>
            <p class="mt-3"><b>Deal proposal time out: </b>24h</p>
            <p class="mt-5"><b># Round: </b>12</p>
            <p><b>Round duration: </b>1h</p>
            <p><b>Slashing condition: </b>100%</p>
            <p class="mt-5"><b>Max appeals: </b>5</p>
            <p><b>Appeal cost: </b>0.2 x payment</p>
            <p class="mt-5"><b>Provider slash: </b></p>
            <p>- Payment completely refunded</p>
            <p>- Collateral goes into protocol's vault</p>
          </div>
          <div class="mt-5">
            <a
              style="text-decoration: none"
              class="btn-light"
              href="https://hackmd.io/Mp3_NyJhSbi-6g8BU_bgTg"
              target="_blank"
              >LEARN MORE</a
            >
          </div>
        </div>
      </div>
    </Transition>
    <!-- ============================== END REFEREE SPECIFICATION ============================== -->
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "../stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";

// import ThemeSwitch from "@/components/ThemeSwitch.vue";
import checkViewport from "@/mixins/checkViewport";
import IcoPolygon from "@/components/elements/IcoPolygon.vue";
import IcoEth from "@/components/elements/IcoEth.vue";
import IcoChevronRight from "@/components/elements/IcoChevronRight.vue";
import IcoDisconnect from "@/components/elements/IcoDisconnect.vue";

export default {
  mixins: [checkViewport],
  props: ["expertMode", "balance", "navSpec", "referees"],
  components: {
    IcoEth,
    IcoPolygon,
    IcoChevronRight,
    IcoDisconnect,
  },
  data() {
    return {
      // LAYOUT
      networks: [],
      navState: false,
      logState: false,
      totalValue: [],
      searcher: "",
      openSelect: false,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },
  async mounted() {
    const app = this;
    if (app.$route.params.searcher !== undefined) {
      app.searcher = app.$route.params.searcher;
    }
  },
  watch: {
    searcher() {
      const app = this;
      if (
        app.searcher !== undefined &&
        app.searcher.length > 3 &&
        app.$route.name === "create-deal"
      ) {
        console.log("searching watcher");
        console.log("searcher length", app.searcher.length);
        app.search();
      }
      if (
        app.searcher !== undefined &&
        app.searcher.length < 1 &&
        app.$route.name !== "create-deal"
      ) {
        app.search();
      }
    },
  },

  methods: {
    search() {
      const app = this;
      console.log("Init saearchhhh");
      if (
        app.$route.name === "create-deal" ||
        app.$route.name === "dashboard"
      ) {
        window.location.href = "/#/app/my-deals/" + app.searcher;
      } else {
        app.$emit("searchDealURI", app.searcher);
      }
    },
    resetSearch() {
      const app = this;
      app.searcher = "";
      if (app.$route.name !== "create-deal") {
        window.location.href = "/#/app/my-deals";
      } else {
        window.location.href = "/#/app";
      }
    },
  },
};
</script>

<style scoped>
.b-tooltip.is-multiline.is-medium .tooltip-content {
  width: 100px !important;
}
</style>
