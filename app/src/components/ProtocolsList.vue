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
            class="is-flex is-align-items-center is-justify-content-space-between px-3 py-4"
          >
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
          </div>
          <div class="divider"></div>
          <div
            class="is-flex is-align-items-center is-justify-content-space-between p-3"
          >
            <p>Total Value:</p>
            <p>
              <b>{{ deals.details[protocol].value }} wei</b>
            </p>
          </div>
          <div class="divider"></div>
          <div
            class="is-flex is-align-items-center is-justify-content-space-between p-3"
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
            class="is-flex is-align-items-center is-justify-content-space-between p-3"
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
export default {
  name: "protocols-list",
  props: ["deals"],

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
