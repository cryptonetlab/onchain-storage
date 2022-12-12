<template>
  <div>
    <Transition name="slide">
      <div v-if="!custom && $route.name === 'create-deal'">
        <div class="mt-4 mb-3">
          <p class="">Click on the button below to confirm.</p>
        </div>
      </div>
    </Transition>
    <Transition name="slide">
      <div v-if="custom" class="section-checkout">
        <!-- // NETWORK -->
        <div>
          <div class="mb-4 mt-4">
            <h2 class="m-0">1. Select the network</h2>
          </div>

          <div class="custom-card border-primary-lighter py-2 px-5 mb-4">
            <!-- TODO: implement network list when available -->

            <div
              class="is-flex is-align-items-center is-justify-content-space-between"
            >
              <div
                class="is-flex is-align-items-center is-justify-content-space-between py-2"
              >
                <b-checkbox
                  type="is-info"
                  size="is-medium"
                  :native-value="false"
                  v-model="refereeNetwork"
                  checked
                >
                </b-checkbox>
                <div
                  style="cursor: pointer"
                  @click="showNetwork = !showNetwork"
                >
                  <p class="ml-3 mb-1"><b>Referee Network #1</b></p>
                  <p class="ml-3">
                    {{ web3Store.protocolsContracts.Retriev }}
                  </p>
                </div>
              </div>
              <div style="cursor: pointer" @click="showNetwork = !showNetwork">
                <i
                  v-if="!showNetwork"
                  class="mdi mdi-chevron-right medium-font"
                ></i>
                <i
                  v-if="showNetwork"
                  class="mdi mdi-chevron-down medium-font"
                ></i>
              </div>
            </div>

            <Transition name="slide">
              <div class="mt-5" v-if="showNetwork">
                <div class="mb-5">
                  <p class="pl-3 mb-1">Referee ID's</p>
                  <div class="custom-card border-primary py-3 px-4">
                    <div v-if="referees !== undefined && referees.length > 0">
                      <a
                        class="hover-underline"
                        style="display: block"
                        :href="
                          'https://rinkeby.etherscan.io/address/' + referee
                        "
                        target="_blank"
                        v-for="referee in referees"
                        :key="referee.index"
                      >
                        {{ referee }}
                      </a>
                    </div>
                  </div>
                </div>
                <div class="mb-4">
                  <p class="pl-3 mb-1">Terms of agreement</p>
                  <div class="custom-card border-primary-lighter py-3">
                    <div
                      class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                    >
                      <p class="">Deal proposal timeout</p>
                      <p><b>24h</b></p>
                    </div>
                    <div class="divider"></div>
                    <div
                      class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                    >
                      <p class=""># round</p>
                      <p><b>12</b></p>
                    </div>
                    <div class="divider"></div>
                    <div
                      class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                    >
                      <p class="">Slashing condition</p>
                      <p><b>100%</b></p>
                    </div>
                    <div class="divider"></div>
                    <div
                      class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                    >
                      <p class="">Max Appeal</p>
                      <p><b>5</b></p>
                    </div>
                    <div class="divider"></div>
                    <div
                      class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                    >
                      <p class="">Appeal cost</p>
                      <p><b>0.2x payment</b></p>
                    </div>
                    <div class="divider"></div>
                    <div
                      class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                    >
                      <p class="">Provider slash if</p>
                      <div>
                        <p class="m-0 has-text-right">
                          <b>- Payment completely refunded</b>
                        </p>
                        <p class="m-0 has-text-right">
                          <b> - Collateral goes into protocol's vault</b>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <b-field>
                  <b-checkbox-button
                    type="is-info"
                    native-value="false"
                    v-model="refereeNetwork"
                    checked
                    :disabled="isWorking"
                  >
                    <span>Select Network</span>
                  </b-checkbox-button>
                </b-field>
              </div>
            </Transition>
          </div>
        </div>
        <!-- SELECT NETWORK -->

        <!-- // PROVIDER -->
        <Transition name="slide">
          <div
            v-if="refereeNetwork === true && providers !== undefined"
            class="mt-4 mb-4"
          >
            <div class="mb-4 mt-4">
              <h2 class="m-0">2. Select the provider</h2>
            </div>
            <div
              v-for="provider in providers"
              :key="provider"
              class="custom-card border-primary-lighter py-2 px-5 mb-4"
            >
              <!-- ACTION BAR  -->
              <div
                class="is-flex is-align-items-center is-justify-content-space-between"
              >
                <div
                  class="is-flex is-align-items-center is-justify-content-space-between"
                >
                  <b-checkbox
                    type="is-info"
                    size="is-medium"
                    v-model="dealProviders"
                    :native-value="provider"
                  >
                  </b-checkbox>
                  <div style="cursor: pointer" @click="showDetails(provider)">
                    <p class="ml-3 mb-1">
                      <b>
                        {{
                          provider.substr(0, 4) + "..." + provider.substr(-4)
                        }}</b
                      >
                    </p>
                    <p v-if="providersPolicy !== undefined" class="ml-3 small">
                      {{ providersPolicy[provider].endpoint }}
                    </p>
                  </div>
                </div>
                <div style="cursor: pointer" @click="showDetails(provider)">
                  <i
                    v-if="isOpen !== provider"
                    class="mdi mdi-chevron-right medium-font"
                  ></i>
                  <i
                    v-if="isOpen === provider"
                    class="mdi mdi-chevron-down medium-font"
                  ></i>
                </div>
              </div>

              <!-- PROVIDER DETAILS -->
              <Transition name="slide">
                <div class="mt-5" v-if="isOpen === provider">
                  <div class="mb-4">
                    <p class="pl-3 mb-1">Deal details</p>
                    <div class="custom-card border-primary-lighter py-3">
                      <div
                        class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                      >
                        <p class="">Max Size</p>
                        <p
                          v-if="providersPolicy[provider].maxSize !== undefined"
                        >
                          <b>
                            {{
                              providersPolicy[provider].maxSize / 1000000
                            }}MB</b
                          >
                        </p>
                      </div>
                      <div class="divider"></div>
                      <div
                        class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                      >
                        <p class="">Max Collateral</p>
                        <p><b>300 wei</b></p>
                      </div>
                      <div class="divider"></div>
                      <div
                        class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                      >
                        <p class="">Max duration</p>
                        <p
                          v-if="
                            providersPolicy[provider].maxDuration !== undefined
                          "
                        >
                          <b>
                            {{ providersPolicy[provider].maxDuration }}
                            days</b
                          >
                        </p>
                      </div>
                      <div class="divider"></div>
                      <div
                        class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                      >
                        <p class="">Wei/B per sec</p>
                        <p>
                          <b> {{ providersPolicy[provider].price }}</b>
                        </p>
                      </div>
                      <div class="divider"></div>
                      <div
                        class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                      >
                        <p class="">Score 1</p>
                        <p>
                          <b> 4.5/5</b>
                        </p>
                      </div>
                      <div class="divider"></div>
                      <div
                        class="is-flex is-align-items-center is-justify-content-space-between px-4 py-2"
                      >
                        <p class="">Score 2</p>
                        <p>
                          <b> 3.5/5</b>
                        </p>
                      </div>
                    </div>
                  </div>
                  <b-field>
                    <b-checkbox-button
                      type="is-black"
                      :disabled="isWorking"
                      v-model="dealProviders"
                      :native-value="provider"
                    >
                      <span>Select provider</span>
                    </b-checkbox-button>
                  </b-field>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>

        <!-- CREATE DEAL - Select duration, payment, collateral -->
        <Transition name="slide">
          <div v-if="dealProviders && refereeNetwork">
            <div class="mb-4 mt-4">
              <h2 class="m-0">3. Checkout</h2>
            </div>
            <div>
              <!-- Deal Duration -->
              <div>
                <!-- Deal input fields -->
                <div class="mb-5">
                  <div class="is-flex is-align-items-center mb-3">
                    <b-tooltip
                      position="is-right"
                      type="is-info"
                      label="Type or select a duration for your deal."
                      multilined
                    >
                      <i class="mdi mdi-information-outline mr-2"></i>
                    </b-tooltip>
                    <p>Deal Duration</p>
                  </div>
                  <div>
                    <b-field>
                      <b-radio-button
                        class="fixed-width"
                        v-model="dealDurationDays"
                        :disabled="isWorking"
                        :native-value="7"
                        type="is-info is-outlined"
                      >
                        <span>Week</span>
                      </b-radio-button>

                      <b-radio-button
                        class="fixed-width"
                        v-model="dealDurationDays"
                        :disabled="isWorking"
                        :native-value="31"
                        type="is-info  is-outlined"
                      >
                        <span>Month</span>
                      </b-radio-button>

                      <b-radio-button
                        class="fixed-width"
                        v-model="dealDurationDays"
                        :disabled="isWorking"
                        :native-value="365"
                        type="is-info is-outlined"
                      >
                        <span>Year</span>
                      </b-radio-button>

                      <b-radio-button
                        class="fixed-width"
                        disabled
                        type="is-info is-outlined"
                      >
                        <span>Forever</span>
                      </b-radio-button>
                    </b-field>
                  </div>
                  <p class="pt-3 small recap-deal">
                    Deal Duration is:
                    <b>{{ dealDurationDays }} days</b>
                  </p>
                </div>
                <!-- ALERT BANNER DURATION -->
                <div
                  v-if="
                    dealProviders[0] &&
                    providersPolicy[dealProviders[0]].maxDuration !==
                      undefined &&
                    dealDurationDays >
                      providersPolicy[dealProviders[0]].maxDuration
                  "
                  class="alert-banner p-2 mt-3 mb-3"
                >
                  <p>
                    <i class="mdi mdi-alert-circle-outline mr-3"></i>
                    <b
                      >Duration is too long, provider may not accept the deal.
                    </b>
                  </p>
                </div>
              </div>
              <!-- Select Payment -->
              <div class="mb-5">
                <div class="is-flex is-align-items-center mb-3">
                  <b-tooltip
                    type="is-info"
                    label="Select payment for your deal, value will be calculated after uploading the file"
                    multilined
                  >
                    <i class="mdi mdi-information-outline mr-2"></i>
                  </b-tooltip>
                  <p>Deal Cost</p>
                </div>
                <div>
                  <div class="is-flex is-align-items-center">
                    <b-button
                      class="bnt-radio-custom fixed-width mr-4"
                      :disabled="isWorking"
                      :type="{ 'is-info': selectedPriority === 0 }"
                      @click="calculateDealValue(0)"
                      >Free</b-button
                    >
                    <b-button
                      class="bnt-radio-custom fixed-width mr-4"
                      :disabled="isWorking"
                      :type="{ 'is-info': selectedPriority === 1 }"
                      @click="calculateDealValue(1)"
                      >Low</b-button
                    >
                    <b-button
                      class="bnt-radio-custom fixed-width mr-4"
                      :disabled="isWorking"
                      :type="{ 'is-info': selectedPriority === 2 }"
                      @click="calculateDealValue(2)"
                      >Medium</b-button
                    >
                    <b-button
                      class="bnt-radio-custom fixed-width"
                      :disabled="isWorking"
                      :type="{ 'is-info': selectedPriority === 5 }"
                      @click="calculateDealValue(5)"
                      >High</b-button
                    >
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                  <div
                    v-if="dealValue < baseDealValue"
                    class="alert-banner p-2 mt-3 mb-3"
                  >
                    <p>
                      <i class="mdi mdi-alert-circle-outline mr-3"></i>
                      <b
                        >Value is below minimum price, provider may not accept
                        the deal.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                </div>
                <p class="mt-3 small recap-deal">
                  You are paying:
                  <b class="">{{ dealValue }} WEI</b>
                </p>
              </div>
              <!-- Collateral Input -->
              <div class="mb-5">
                <div class="is-flex is-align-items-center mb-3">
                  <b-tooltip
                    v-if="dealValue !== undefined && parseInt(dealValue) > 0"
                    type="is-info"
                    label="Select size of collateral"
                    multilined
                  >
                    <i class="mdi mdi-information-outline mr-2"></i>
                  </b-tooltip>
                  <b-tooltip
                    v-if="dealValue !== undefined && parseInt(dealValue) === 0"
                    type="is-warning"
                    label="When deal is free the size of the collateral cannot be changed"
                    multilined
                  >
                    <i class="mdi mdi-information-outline mr-2"></i>
                  </b-tooltip>
                  <p>Collateral</p>
                </div>
                <div>
                  <div class="is-flex is-align-items-center">
                    <b-button
                      :disabled="dealValue === 0 || isWorking"
                      class="bnt-radio-custom fixed-width mr-4"
                      :type="{
                        'is-info':
                          dealCollateral === parseInt(dealValue) &&
                          parseInt(dealValue) > 0,
                      }"
                      @click="dealCollateral = parseInt(dealValue)"
                      >Minimum</b-button
                    >
                    <b-button
                      :disabled="dealValue === 0 || isWorking"
                      class="bnt-radio-custom fixed-width mr-4"
                      :type="{
                        'is-info':
                          dealCollateral ===
                            parseInt(dealValue) * (slashingMultiplier / 100) &&
                          dealValue > 0,
                      }"
                      @click="
                        dealCollateral =
                          parseInt(dealValue) * (slashingMultiplier / 100)
                      "
                      >Low</b-button
                    >
                    <b-button
                      :disabled="dealValue === 0 || isWorking"
                      class="bnt-radio-custom fixed-width mr-4"
                      :type="{
                        'is-info':
                          dealCollateral ===
                            parseInt(dealValue) * (slashingMultiplier / 10) &&
                          dealValue > 0,
                      }"
                      @click="
                        dealCollateral =
                          parseInt(dealValue) * (slashingMultiplier / 10)
                      "
                      >Medium</b-button
                    >
                    <b-button
                      :disabled="dealValue === 0 || isWorking"
                      class="bnt-radio-custom fixed-width"
                      :type="{
                        'is-info':
                          dealCollateral ===
                            parseInt(dealValue) * slashingMultiplier &&
                          dealValue > 0,
                      }"
                      @click="
                        dealCollateral =
                          parseInt(dealValue) * slashingMultiplier
                      "
                      >Max</b-button
                    >
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                  <div v-if="dealCollateralLow" class="alert-banner p-2 mt-3">
                    <p>
                      <i class="mdi mdi-alert-circle-outline mr-3"></i>
                      <b
                        >Collateral is less than the Deal value. Keep attention
                        storage is at your own risk.
                      </b>
                    </p>
                  </div>
                  <!-- ALERT BANNER PAYMENT -->
                </div>

                <p class="mt-3 small recap-deal">
                  Your Collateral:
                  <b class=""> {{ dealCollateral }} WEI</b>
                </p>
              </div>
              <!-- END | Collateral Input -->
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
    <!-- END | Dealinput fields -->

    <div
      class="mt-2"
      :class="{
        'is-flex is-align-items-center': $route.name === 'create-deal',
      }"
    >
      <div
        v-if="
          dealUri !== undefined &&
          dealUri.length > 0 &&
          $route.name !== 'create-deal'
        "
        class="mb-4"
      >
        <RetrievRecapDeal
          :dealCollateral="dealCollateral"
          :dealDurationDays="dealDurationDays"
          :dealValue="dealValue"
        />
      </div>

      <b-button
        v-if="!custom && $route.name === 'create-deal'"
        @click="customize()"
        class="btn-light mr-4"
        >Customize</b-button
      >
      <b-button v-if="custom" @click="defaultCreate()" class="btn-light mr-4"
        >Default</b-button
      >

      <b-button
        class="btn-primary"
        :disabled="
          isWorking ||
          (custom && refereeNetwork.length === 0) ||
          dealProviders.length === 0
        "
        @click="createDealProposal()"
      >
        Create deal proposal
      </b-button>
    </div>
    <PendingTx
      :isCreatingDeal="isCreatingDeal"
      :activeStep="activeStep"
      :pendingTx="pendingTx"
      :receipt="receipt"
      @closeModalTx="closeModalTx()"
    />
    <!-- RECAP DEAL: DEAL MAKER TOOL  -->
    <div
      class="column is-3 deal-summary"
      style="transition: all 0.25s"
      v-if="
        dealUri !== undefined &&
        dealUri.length > 0 &&
        $route.name === 'create-deal'
      "
    >
      <h2 class="has-text-centered my-5">Deal Summary</h2>
      <div class="px-3">
        <RecapDeal
          :providers="providers"
          :dealCollateral="dealCollateral"
          :dealValue="dealValue"
          :dealDurationDays="dealDurationDays"
          :dealProviders="dealProviders"
          :fileToUpload="fileToUpload"
          :custom="custom"
        />
      </div>
    </div>
    <!-- END |  RECAP DEAL  -->
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";

import RetrievRecapDeal from "@/components/fast-create/RetrievRecapDeal.vue";
import RecapDeal from "@/components/retrieval-pinning/RecapDeal.vue";
import PendingTx from "@/components/PendingTx.vue";

import axios from "axios";
const abi = require("./abi.json");
export default {
  name: "retriev",
  props: ["dealUri", "fileToUpload", "fileSize", "isMempool"],
  components: {
    RetrievRecapDeal,
    RecapDeal,
    PendingTx,
  },
  data() {
    return {
      abi: abi,
      // PROVIDERS AND REFEREES
      referees: [],
      providers: [],
      refereeNetwork: false,
      dealProviders: [],
      providersPolicy: {},
      //DEAL CREATION
      minDuration: 3600,
      maxDuration: 42000,
      dealDuration: 86400 * 365,
      dealDurationDays: 365,
      dealCollateral: 0,
      dealCollateralLow: 0,
      baseDealValue: 0,
      selectedPriority: 0,
      slashingMultiplier: 1000,
      dealValue: 0,

      // FOR LAYOUT
      isWorking: false,
      custom: false,
      showNetwork: false,
      isOpen: -1,

      //tx modal
      activeStep: 0,
      isCreatingDeal: false,
      pendingTx: "",
      receipt: "",

      //mempool
      checkMempool: false,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },
  mounted() {
    const app = this;
    app.checkMempool = app.isMempool;
    app.loadState();
  },
  watch: {
    dealProviders() {
      const app = this;
      if (app.fileToUpload.size !== undefined) {
        app.dealValue = parseInt(
          parseInt(app.providersPolicy[app.dealProviders[0]].price) *
            parseInt(app.dealDurationDays) *
            86400 *
            parseInt(app.fileToUpload.size)
        );
        app.baseDealValue = app.dealValue;
        app.dealValue = app.dealValue * app.selectedPriority;
      }
    },
    dealDurationDays() {
      const app = this;
      // Duration day limit max and min on input
      if (app.dealDurationDays > 365) {
        app.dealDurationDays = 365;
      }

      if (app.dealDurationDays === "") {
        app.dealDurationDays = 7;
      }
      // TODO: Handle case where providers > 1
      if (app.fileToUpload.size !== undefined) {
        app.dealValue = parseInt(
          parseInt(app.providersPolicy[app.dealProviders[0]].price) *
            parseInt(app.dealDurationDays) *
            86400 *
            parseInt(app.fileToUpload.size)
        );
        app.baseDealValue = app.dealValue;
        app.dealValue = app.dealValue * app.selectedPriority;
      }
      app.dealDuration = parseInt(app.dealDurationDays * 86400);
      console.log("Calculate dealDuration", app.dealDuration);
    },
    async dealValue() {
      const app = this;
      // dealValue limit min on input
      if (app.dealValue < 0) {
        app.dealValue = 0;
      } else if (app.dealValue === "") {
        app.dealValue = 0;
      }
      app.dealCollateral = parseInt(app.dealValue);
    },
    async dealCollateral() {
      const app = this;
      const collateralDeal =
        parseInt(app.dealCollateral) - parseInt(app.dealValue);
      if (collateralDeal > -1) {
        app.dealCollateralLow = false;
      } else {
        app.dealCollateralLow = true;
      }
      const maximumCollateral =
        parseInt(app.slashingMultiplier) * parseInt(app.dealValue);
      console.log("max collateral", maximumCollateral);
      if (parseInt(app.dealCollateral) > parseInt(maximumCollateral)) {
        console.log(
          "Min collateral is " + maximumCollateral + ", please fix it!"
        );
      }
    },
  },
  methods: {
    async loadState() {
      const app = this;
      app.isWorking = true;
      console.log("Reading state from blockchain..");
      const contract = new app.web3Store.web3.eth.Contract(
        app.abi,
        app.web3Store.protocolsContracts.Retriev
      );
      app.slashingMultiplier = parseInt(
        await contract.methods.slashing_multiplier().call()
      );
      app.minDuration = parseInt(await contract.methods.min_duration().call());
      app.maxDuration = await contract.methods.max_duration().call();
      console.log("Min duration is: " + app.minDuration);
      console.log("Max duration is: " + app.maxDuration);

      // Connecting to p2p network

      // Check Providers
      app.providers = [];
      const providersApi = await axios.get(
        process.env.VUE_APP_API_URL_RETRIEV + "/providers"
      );
      for (let k in providersApi.data) {
        const provider = providersApi.data[k];
        if (app.providers.indexOf(provider.address) === -1) {
          app.providers.push(provider.address);
          app.providersPolicy[provider.address] = {
            maxSize: provider.strategy.max_size,
            price: provider.strategy.min_price,
            maxDuration: provider.strategy.max_duration,
            maxCollateralMultiplier:
              provider.strategy.max_collateral_multiplier,
            endpoint: provider.endpoint,
          };
          if (app.providersPolicy[provider.address].maxSize === undefined) {
            app.providersPolicy[provider.address].maxSize = 20000000;
          }
          // app.dealProviders.push(provider.address);
          // app.canDoProposal = true;
        }
      }
      app.dealProviders.push(app.providers[0]);
      // Checking Referees

      let ended = false;
      let i = 0;
      while (!ended) {
        try {
          const referee = await contract.methods.active_referees(i).call();
          if (app.referees.indexOf(referee) === -1) {
            app.referees.push(referee);
          }
        } catch (e) {
          console.log(e);
          ended = true;
        }
        i++;
      }

      //check Deal Value
      app.checkDealValue();

      console.log("Providers", app.providers);
      console.log("Referees", app.referees);
      console.log("DEFAULT PROVIDERS:", app.dealProviders);
      console.log("Found " + app.providers.length + " active providers");
      app.$toast.clear();
      app.isWorking = false;
    },

    checkDealValue() {
      const app = this;
      console.log("checking deal value");
      if (
        app.providersPolicy[app.dealProviders[0]].maxSize !== undefined &&
        app.fileToUpload.size <
          app.providersPolicy[app.dealProviders[0]].maxSize
      ) {
        app.dealValue =
          app.providersPolicy[app.dealProviders[0]].price *
          app.dealDuration *
          app.fileToUpload.size;
        app.baseDealValue = app.dealValue;
        app.dealValue = app.dealValue * app.selectedPriority;
      } else if (
        app.providersPolicy[app.dealProviders[0]].maxSize !== undefined
      ) {
        // app.alertCustomError(
        //   "File is too big, provider will not accept the deal!"
        // );
        app.fileToUpload = "";
        app.canDoProposal = false;
      } else {
        setTimeout(function () {
          app.checkDealValue();
        }, 5000);
      }
      console.log("changed Deal value, now is: ", app.dealValue);
    },

    calculateDealValue(priority) {
      const app = this;
      app.selectedPriority = priority;
      app.dealValue = app.baseDealValue * priority;

      console.log("selected priority", app.selectedPriority);
      console.log("deal value calcutaleted from priority", app.dealValue);
    },

    async createDealProposal() {
      const app = this;
      if (!app.isWorking) {
        console.log("Checking all data in field to create Deal");
        console.log("Deal Duration", app.dealDuration);
        console.log(
          "Min duration",
          app.minDuration,
          "and Max Duration",
          app.maxDuration
        );
        console.log("Deal URI", app.dealUri);
        console.log("dealProviders", app.dealProviders);

        if (
          parseInt(app.dealDuration) >= parseInt(app.minDuration) &&
          parseInt(app.dealDuration) <= parseInt(app.maxDuration) &&
          app.dealUri.length > 0 &&
          app.dealProviders.length > 0
        ) {
          const maximumCollateral = app.slashingMultiplier * app.dealValue;
          if (parseInt(app.dealCollateral) <= parseInt(maximumCollateral)) {
            app.isCreatingDeal = true;
            app.activeStep = 0;
            app.isWorking = true;
            app.$emit("notification", "Please confirm action with metamask..");
            try {
              const contract = new app.web3Store.web3.eth.Contract(
                app.abi,
                app.web3Store.protocolsContracts.Retriev
              );
              console.log("Appeal Addresses typed are:", app.appealAddresses);
              console.log("ALL DATA NEEDED", {
                URI: app.dealUri,
                DURATION: app.dealDuration,
                COLLATERAL: app.dealCollateral.toString(),
                PROVIDERS: app.dealProviders,
                ACCOUNT: [app.web3Store.account],
              });
              const gasPrice = await app.web3Store.web3.eth.getGasPrice();
              const BN = app.web3Store.web3.utils.BN;
              const gp = new BN(gasPrice.toString());
              const doubled = gp.mul(new BN("2")).toString();

              // TODO: THIS IS FOR A TEST, MOVE "Send To mempool" after "creteDealProposal"

              // Send to MemPool
              // const sendMempool = await axios.post(app.apiMempool, {
              // dealUri: app.dealUri,
              // duration: app.dealDuration,
              // collateral: app.dealCollateral.toString(),
              // providers: app.dealProviders,
              // address: [app.web3Store.account],
              // });
              // console.log("Response is", sendMempool);
              app.checkMempool = true;
              app.$emit("checkMempool", app.checkMempool);
              // END | Send to MemPool

              const receipt = await contract.methods
                .createDealProposal(
                  app.dealUri,
                  app.dealDuration,
                  app.dealCollateral.toString(),
                  app.dealProviders,
                  [app.web3Store.account]
                )
                .send({
                  value: app.dealValue.toString(),
                  from: app.web3Store.account,
                  gasPrice: doubled,
                })
                .on("transactionHash", (tx) => {
                  localStorage.setItem("pendingTx", tx);
                  localStorage.setItem("pendingProtocol", "Retriev");
                  app.activeStep = 1;
                  app.pendingTx = tx;
                });

              console.log("BLOCKCHAIN_RECEIPT ", receipt);
              app.receipt = receipt.blockHash;
              app.activeStep = 2;
              setTimeout(async function () {
                // window.location.href = "/#/app/my-deals";
              }, 5000);
            } catch (e) {
              app.isWorking = false;
              app.$emit("alert", e.message);
              app.isCreatingDeal = false;
            }
          } else {
            app.$emit(
              "alert",
              "Max collateral is " +
                maximumCollateral +
                " while minimum is same of value!"
            );
            app.isCreatingDeal = false;
          }
        } else {
          app.$emit("alert", "Please fill all fields!");
          app.isCreatingDeal = false;
        }
      } else {
        console.log("App busy, retry.");
        app.isCreatingDeal = false;
      }
      app.isWorking = false;
    },

    showDetails(provider) {
      const app = this;
      if (app.isOpen === provider) {
        app.isOpen = -1;
      } else {
        app.isOpen = provider;
      }
    },

    customize() {
      const app = this;
      app.refereeNetwork = "";
      app.custom = !app.custom;
      if (app.custom) {
        app.refereeNetwork = "";
      } else {
        app.refereeNetwork = app.web3Store.protocolsContracts.Retriev;
      }
    },

    defaultCreate() {
      const app = this;
      app.custom = !app.custom;
      app.refereeNetwork = app.web3Store.protocolsContracts.Retriev;
      app.dealProviders = [];
      app.dealProviders.push(app.providers[0]);
      app.dealDuration = 86400 * 365;
      app.dealDurationDays = 365;
    },

    // alertCustomError(message) {
    //   this.$buefy.dialog.alert({
    //     title: "Error",
    //     message: message,
    //     type: "is-danger",
    //     hasIcon: true,
    //     icon: "times-circle",
    //     iconPack: "fa",
    //     ariaRole: "alertdialog",
    //     ariaModal: true,
    //   });
    // },

    closeModalTx() {
      const app = this;
      app.isCreatingDeal = false;
      if (app.$route.name === "dashboard") {
        window.location.reload();
      }
    },
  },
};
</script>
