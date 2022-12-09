<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "./stores/web3Store";
import { routesSpecs } from "./router/index";

export default {
  name: "app",
  computed: {
    ...mapStores(useWeb3Store),
  },
  watch: {
    async $route(to, from) {
      const app = this;
      this.checkOverflow();
      if (!routesSpecs[this.$route.name]?.excludeAutoConnect) {
        if (!app.web3Store.web3) {
          try {
            app.web3Store.fetchNetowrk();
            await app.web3Store.fetchingContract();
          } catch (e) {
            console.log("Fetching Networks failed!");
          }
        }
      }
    },
  },
  async mounted() {
    const app = this;
    this.checkOverflow();
    if (!routesSpecs[this.$route.name]?.excludeAutoConnect) {
      if (!app.web3Store.web3) {
        try {
          app.web3Store.fetchNetowrk();
          await app.web3Store.fetchingContract();
        } catch (e) {
          console.log("Fetching Networks failed!");
        }
      }
    }
  },
  methods: {
    checkOverflow() {
      const app = this;
      let landing = document.getElementsByTagName("html")[0];
      if (app.$route.name === "landing") {
        landing.style.overflow = "auto";
      } else {
        landing.style.overflow = "hidden";
      }
    },
  },
};
</script>

<style>
*,
.input {
  font-family: "Albert Sans", sans-serif;
}

.no-overflow {
  overflow-y: hidden !important;
}
</style>
