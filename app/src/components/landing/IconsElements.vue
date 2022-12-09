<template>
  <div class="landing">
    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 0" class="top-right-el icon-el">
        <img src="../../assets/img/landing/el1.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 1" class="top-left-el icon-el">
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 2" class="bottom-left-el icon-el">
        <img src="../../assets/img/landing/el3.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 3" class="bottom-right-el icon-el">
        <img src="../../assets/img/landing/el1.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div
        v-if="step > 4 && !isTablet && !isMobile"
        class="top-more-right-el icon-el"
      >
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 5" class="top-more-left-el icon-el">
        <img
          v-if="isDesktop || isTablet"
          src="../../assets/img/landing/el1.svg"
          alt=""
        />
        <img v-if="isMobile" src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div
        v-if="step > 6 && !isMobile && !isTablet"
        class="bottom-more-left-el icon-el"
      >
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div
        v-if="step > 7 && !isTablet && !isMobile"
        class="bottom-more-right-el icon-el"
      >
        <img src="../../assets/img/landing/el3.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 8" class="top-center-el icon-el">
        <img
          v-if="isDesktop || isTablet"
          src="../../assets/img/landing/el1.svg"
          alt=""
        />
        <img v-if="isMobile" src="../../assets/img/landing/el3.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 9 && !isMobile" class="bottom-center-el icon-el">
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div
        v-if="step > 10 && !isMobile && !isTablet"
        class="left-center-el icon-el"
      >
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div v-if="step > 11 && !isMobile" class="right-center-el icon-el">
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div
        v-if="step > 12 && !isMobile && !isTablet"
        class="random-one-el icon-el"
      >
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div
        v-if="step > 13 && !isMobile && !isTablet"
        class="random-two-el icon-el"
      >
        <img src="../../assets/img/landing/el2.svg" alt="" />
      </div>
    </Transition>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";

export default {
  mixins: [checkViewport],
  data() {
    return {
      step: 0,
    };
  },
  watch: {
    step: {
      handler() {
        const app = this;
        if (app.step === 15) {
          console.log("try to increment");
          clearInterval(app.increasingID);
          app.decreasingStep();
        } else if (app.step === 0) {
          console.log("try to decreasing");
          clearInterval(app.decreasingID);
          app.incrementStep();
        }
      },
    },
  },
  mounted() {
    const app = this;
    setTimeout(function () {
      console.log("start animation icon");
      app.incrementStep();
    }, 1000);
  },
  methods: {
    incrementStep() {
      const app = this;
      // console.log("iconAnimation started", app.step);
      app.increasingID = setInterval(function () {
        app.step++;
        // console.log("increment step", app.step);
      }, 2000);
    },
    decreasingStep() {
      const app = this;
      // console.log("iconAnimation started", app.step);
      app.decreasingID = setInterval(function () {
        app.step--;
        // console.log("increment step", app.step);
      }, 2000);
    },
  },
};
</script>

<style scoped></style>
