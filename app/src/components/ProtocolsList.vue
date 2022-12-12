<template>
  <div>
    <div class="columns">
      <div
        v-for="(protocol, index) in deals.protocols"
        :key="index"
        class="column is-half"
      >
        <div class="custom-card border-primary-lighter">
          <div
            class="is-flex is-align-items-center is-justify-content-space-between px-4 py-5"
          >
            <!-- Protocols logo -->
            <div class="is-flex is-align-items-center">
              <img
                v-if="protocol === 'retriev-goerli'"
                width="37"
                src="../assets/img/ico-retriev.svg"
                alt=""
                class="mr-3"
              />
              <img
                v-if="protocol === 'web3bounty-goerli'"
                width="37"
                src="../assets/img/ico-w3.svg"
                alt=""
                class="mr-3"
              />
              <h4 style="text-transform: capitalize">
                {{ protocol.split("-")[0] }}
              </h4>
            </div>
            <!-- END Protocols logo -->

            <!-- Link to app (external) -->
            <div>
              <a
                style="text-decoration: none"
                :style="[!isDesktop ? { padding: '8px !important' } : {}]"
                v-if="protocol === 'retriev-goerli'"
                href="https://retriev.org"
                target="_blank"
                class="btn-lighter"
                ><span v-if="isDesktop">Manage App</span>
                <i
                  v-if="!isDesktop"
                  class="mdi mdi-export"
                  style="font-size: 1rem"
                ></i
              ></a>
              <a
                v-if="protocol === 'web3bounty-goerli'"
                style="text-decoration: none"
                :style="[!isDesktop ? { padding: '8px !important' } : {}]"
                href="https://web3bounty.app/"
                target="_blank"
                class="btn-lighter"
                ><span v-if="isDesktop">Manage App</span>
                <i
                  v-if="!isDesktop"
                  class="mdi mdi-export"
                  style="font-size: 1rem"
                ></i
              ></a>
            </div>
            <!-- END Link to app (external) -->
          </div>
          <div class="divider"></div>
          <div
            class="is-flex is-align-items-center is-justify-content-space-between p-4"
          >
            <p>Total Value:</p>
            <p>
              <b>{{ deals.details[protocol].value }} wei</b>
            </p>
          </div>
          <div class="divider"></div>
          <div
            class="is-flex is-align-items-center is-justify-content-space-between p-4"
          >
            <p>Active deals:</p>
            <p>
              <b>{{ deals.details[protocol].active }}</b>
            </p>
          </div>
          <div
            v-if="deals.details[protocol].size !== undefined"
            class="divider"
          ></div>
          <div
            v-if="deals.details[protocol].size !== undefined"
            class="is-flex is-align-items-center is-justify-content-space-between p-4"
          >
            <p>Pinning volume:</p>
            <p>
              <b>~{{ parseSize(deals.details[protocol].size) }}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "../mixins/checkViewport";
export default {
  name: "protocols-list",
  props: ["deals"],
  mixins: [checkViewport],
  mounted() {},
  methods: {
    parseSize(size) {
      if (parseFloat(size / 1000000) > 0.5) {
        return parseFloat(size / 1000000).toFixed(3) + " MB";
      } else {
        return parseFloat(size / 1000).toFixed(3) + " KB";
      }
    },
  },
};
</script>
