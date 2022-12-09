<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "app",

  async mounted() {
    const app = this;
    this.checkOverflow();
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
