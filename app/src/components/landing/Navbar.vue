<template>
  <div
    class="landing landing-nav py-4"
    :class="{ sticky: !isMobile, 'fixed-pos slide-top': isFixed }"
    id="navbar-el"
  >
    <div class="container" :class="{ 'px-5': isMobile, 'p-0': isDesktop, }">
      <div
        class="is-flex is-align-items-center"
        :class="{
          'is-justify-content-space-between': !isMobile,
          'is-justify-content-center': isMobile,
        }"
      >
        <div class="is-flex is-align-items-center">
          <img class="logo" src="../../assets/img/logo.svg" alt="" />
          <a class="main-link ml-3" href="/">onchain.storage</a>
        </div>
        <div>
          <div @click="goToApp()" v-if="!isMobile" class="btn-transparent">
            Start to store
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  name: "Navbar",
  components: {},
  mixins: [checkViewport],
  data() {
    return {
      isFixed: false,
    };
  },
  mounted() {
    this.renderNavbar();
  },
  methods: {
    renderNavbar() {
      const app = this;
      const element = document.getElementById("navbar-el");
      if (app.isMobile) {
        setTimeout(function () {
          app.pos = element.offsetTop - 100;
          app.maxpos = element.offsetTop + element.clientHeight;
          document.addEventListener("scroll", (event) => {
            if (window.scrollY > app.pos) {
              if (window.scrollY < app.maxpos) {
                app.isFixed = true;
              }
            } else {
              app.isFixed = false;
            }
          });
        }, 500);
      }
    },
  },
};
</script>
