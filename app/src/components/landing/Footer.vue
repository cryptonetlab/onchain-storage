<template>
  <div class="landing" :class="{ 'b-top-dashed': utilsStore.isTerms }">
    <div
      class="footer container"
      :class="{ 'p-0': !isMobile, 'px-3': isMobile }"
      style="position: relative; z-index: 2; background-color: white"
    >
      <div style="height: auto; min-height: 60vh">
        <div class="columns is-mobile is-multiline p-0 m-0" style="height: 60vh">
          <div
            class="column p-0 is-12-mobile is-8-tablet is-9-desktop is-flex is-flex-direction-column is-justify-content-space-between"
            :class="{ 'b-dashed-right py-5': !isMobile, 'p-5': isMobile }"
          >
            <img width="64" src="../../assets/img/logo.svg" alt="" />
            <div class="mb-5" :class="{ 'mt-5': isMobile }">
              <h4>
                The gateway to your <br />
                on-chain data
              </h4>
            </div>
          </div>
          <div
            class="column is-12-mobile is-4-tablet is-3-desktop p-5"
            :class="{
              'is-align-self-flex-end': !isMobile,
              'is-justify-content-flex-start': isMobile,
            }"
          >
            <div>
              <div class="mb-1">
                <a
                  href="https://github.com/protocol/onchain-storage"
                  target="_blank"
                  ><p class="small"><b>Github</b></p>
                </a>
              </div>
              <div class="mb-1">
                <a
                  href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
                  target="_blank"
                  ><p class="small"><b>Slack</b></p></a
                >
              </div>
              <div class="mb-1">
                <a href="/#/retriev-terms-of-service"
                  ><p class="small"><b>Retriev ToS</b></p></a
                >
              </div>
              <div class="mb-1">
                <a href="/#/w3bounty-terms-of-service"
                  ><p class="small"><b>Web3Bounty ToS</b></p></a
                >
              </div>
              <div>
                <a href="/#/privacy-policy"
                  ><p class="small"><b>Privacy Policy</b></p></a
                >
              </div>

              <div class="mt-5">
                <p class="small">
                  Made with love <br />by
                  <a href="https://protocol.ai/" target="_blank"
                    >Protocol Labs</a
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "@/mixins/checkViewport";
import { mapStores } from "pinia";
import { useUiUtils } from "@/stores/uiUtils";

export default {
  name: "Footer",
  mixins: [checkViewport],
  data() {
    return {
      isTerms: false,
    };
  },
  computed: {
    ...mapStores(useUiUtils),
  },
};
</script>
