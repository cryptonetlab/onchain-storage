<template>
  <div class="protocol-select">
    <div class="mt-5">
      <div class="mb-3">
        <h2 class="m-0">2. Select the protocol</h2>
        <!-- <p class="mt-2">
          Select the protocol lorem ipsum dolor sit amet, consectetuer
          adipiscing elit.
        </p> -->
      </div>
      <div class="columns is-desktop mb-2">
        <!-- Retriev Protocol -->
        <div class="column">
          <div
            class="custom-card px-3 custom-card-hover"
            :class="{
              'border-theme-color': serviceSelected === 'retrieval_pinning',
              'py-4': isDesktop,
              'py-3': !isDesktop,
            }"
          >
            <a class="top-right-pos" href="https://retriev.org" target="_blank">
              <i class="mdi mdi-export"></i
            ></a>

            <b-radio
              type="is-dark"
              size="is-medium"
              native-value="retrieval_pinning"
              v-model="serviceSelected"
              :disabled="isWorking"
            >
              <div class="is-flex is-align-items-center">
                <div>
                  <img
                    :style="[
                      serviceSelected === 'web3bounty' || serviceSelected === ''
                        ? { opacity: '0.5' }
                        : { opacity: '1' },
                    ]"
                    width="40px"
                    src="../assets/img/ico-retriev.svg"
                    alt=""
                  />
                </div>
                <p
                  class="ml-3 mb-1"
                  :style="[
                    serviceSelected === 'web3bounty' || serviceSelected === ''
                      ? { opacity: '0.5' }
                      : { opacity: '1' },
                  ]"
                >
                  <b>Retriev</b>
                </p>
              </div>
              <div>
                <h5
                  class="mt-3"
                  :style="[
                    serviceSelected === 'web3bounty' || serviceSelected === ''
                      ? { opacity: '0.5' }
                      : { opacity: '1' },
                  ]"
                >
                  Retriev provides retrievability assurance for data stored on
                  decentralized networks.
                </h5>
              </div>
            </b-radio>
          </div>
        </div>

        <!-- Web3Bounty Protocol -->
        <div class="column">
          <div
            class="custom-card custom-card-hover px-3"
            :class="{
              'border-theme-color': serviceSelected === 'web3bounty',
              'py-4': isDesktop,
              'py-3': !isDesktop,
            }"
          >
            <a
              class="top-right-pos"
              href="https://web3bounty.app/#/"
              target="_blank"
            >
              <i class="mdi mdi-export"></i
            ></a>
            <b-radio
              type="is-dark"
              size="is-medium"
              native-value="web3bounty"
              v-model="serviceSelected"
              :disabled="isWorking"
            >
              <div class="is-flex is-align-items-center">
                <div>
                  <img
                    :style="[
                      serviceSelected === 'retrieval_pinning' ||
                      serviceSelected === ''
                        ? { opacity: '0.5' }
                        : { opacity: '1' },
                    ]"
                    width="40"
                    src="../assets/img/ico-w3.svg"
                    alt=""
                  />
                </div>
                <div>
                  <p
                    class="ml-3 mb-1"
                    :style="[
                      serviceSelected === 'retrieval_pinning' ||
                      serviceSelected === ''
                        ? { opacity: '0.5' }
                        : { opacity: '1' },
                    ]"
                  >
                    <b>Web3 Bounty</b>
                  </p>
                </div>
              </div>
              <h5
                class="mt-3"
                :style="[
                  serviceSelected === 'retrieval_pinning' ||
                  serviceSelected === ''
                    ? { opacity: '0.5' }
                    : { opacity: '1' },
                ]"
              >
                Web3 Bounty is an on-chain pinning service for IPFS / Filecoin
                through web3.storage.
              </h5>
            </b-radio>
          </div>
        </div>

        <!-- PLACEHOLDER Protocol -->
        <!-- <div class="column">
          <div
            class="custom-card custom-card-hover px-3"
            :class="{ 'py-4': isDesktop, 'py-3': !isDesktop }"
          >
            <b-checkbox
              type="is-dark"
              size="is-medium"
              native-value="false"
              disabled
            >
              <div class="is-flex is-align-items-center">
                <div>
                  <img src="../assets/img/ico-plfy.svg" width="40" alt="" />
                </div>
                <p class="ml-3 mb-1"><b>Coming Soon</b></p>
              </div>

              <h5 class="mt-3">
                The Web3Storage protocol lorem ipsum sit quo stabat mater quo
                nunc amet lorem.
              </h5>
            </b-checkbox>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "SelectProtocol",
  props: ["isWorking", "step", "service", "dealUri"],
  mixins: [checkViewport],
  data() {
    return {
      serviceSelected: "",
      radio: "",
    };
  },
  mounted() {
    const app = this;
    app.serviceSelected = app.service;
  },
  watch: {
    serviceSelected() {
      const app = this;
      app.$emit("checkService", app.serviceSelected);
    },
  },
};
</script>
