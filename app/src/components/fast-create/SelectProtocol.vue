<template>
  <div
    class="is-flex is-align-items-center is-justify-content-start is-flex-wrap-wrap"
  >
    <!-- Retriev Protocol -->
    <div class="py-2 mr-1">
      <b-radio
        type="is-info"
        size="is-medium"
        class="btn-protocol"
        :class="{
          'active-protocol': serviceSelected === 'retrieval_pinning',
        }"
        native-value="retrieval_pinning"
        v-model="serviceSelected"
        :disabled="isWorking"
      >
        <span> Retriev </span>
      </b-radio>
    </div>

    <!-- Web3Bounty Protocol -->
    <div class="py-2">
      <b-radio
        type="is-info"
        size="is-medium"
        class="btn-protocol"
        :class="{
          'active-protocol': serviceSelected === 'web3bounty',
        }"
        native-value="web3bounty"
        v-model="serviceSelected"
        :disabled="isWorking"
      >
        <span> Web3 Bounty </span>
      </b-radio>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "select-protocol-dashboard",
  props: ["service", "dealUri", "isWorking"],
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

<style scoped></style>
