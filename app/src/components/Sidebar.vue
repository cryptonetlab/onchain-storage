<template>
  <div class="sidebar b-right-light">
    <div class="sidebar-content" style="height: 100%; position: relative">
      <div
        class="is-flex-column"
        :class="{ 'has-text-centered': !utilsStore.showSidebar }"
      >
        <!-- <div
          v-if="!isTablet"
          class="px-5 pt-5 pointer"
          :class="{
            'has-text-centered': !utilsStore.showSidebar,
            'has-text-right': utilsStore.showSidebar,
          }"
          @click="utilsStore.toggleSidebar()"
        >
          <i
            v-if="utilsStore.showSidebar"
            class="mdi mdi-chevron-double-left"
          ></i>
          <i
            v-if="!utilsStore.showSidebar"
            class="mdi mdi-chevron-double-right"
          ></i>
        </div> -->
        <!-- PAGE LINK -->
        <a
          href="/#/app/"
          class="is-flex is-align-items-center sidebar-link px-5 mt-6 py-3"
          :class="{
            'is-justify-content-center': !utilsStore.showSidebar,
          }"
        >
          <div>
            <IcoDashboard />
            <span
              :class="{ 'bold-text': $route.name === 'dashboard' }"
              class="ml-3"
              v-if="utilsStore.showSidebar"
              >Dashboard</span
            >
          </div>
        </a>
        <a
          href="/#/app/deal-maker-tool"
          class="is-flex is-align-items-center sidebar-link px-5 py-3"
          :class="{
            'is-justify-content-center': !utilsStore.showSidebar,
          }"
        >
          <div>
            <IcoCreateDeal />
            <span
              class="ml-3"
              :class="{ 'bold-text': $route.name === 'create-deal' }"
              v-if="utilsStore.showSidebar"
              >Deal Maker <span v-if="isDesktop">Tool</span></span
            >
          </div>
        </a>
        <div
          class="is-flex is-align-items-center disabled sidebar-link px-5 py-3"
          :class="{
            'is-justify-content-center': !utilsStore.showSidebar,
            'is-justify-content-space-between': utilsStore.showSidebar,
          }"
        >
          <div class="is-flex is-align-items-center">
            <IcoProtocols />
            <span v-if="utilsStore.showSidebar" class="ml-3">Protocols</span>
          </div>
          <!-- <i v-if="utilsStore.showSidebar" class="mdi mdi-chevron-right"></i> -->
          <div
            v-if="utilsStore.showSidebar && isDesktop"
            class="badge badge-soon"
          >
            Soon
          </div>
        </div>

        <!-- <div
          class="mt-4 is-flex is-align-items-center"
          :class="{
            'is-justify-content-center': !showSidebar,
          }"
        >
          <i class="mdi mdi-format-list-bulleted-square"></i>
          <a href="/#/app/my-deals">
            <span
              :class="{ 'bold-text': isDealList }"
              class="ml-2"
              v-if="showSidebar"
              >My Deals</span
            ></a
          >
        </div> -->
        <a
          class="disabled is-flex is-align-items-center sidebar-link px-5 py-3"
          :class="{
            'is-justify-content-center': !utilsStore.showSidebar,
            'is-justify-content-space-between': utilsStore.showSidebar,
          }"
        >
          <div>
            <IcoTools />
            <span
              :class="{ 'bold-text': utilsStore.isDealList }"
              class="ml-3"
              v-if="utilsStore.showSidebar"
              >Automations</span
            >
          </div>
          <div
            v-if="utilsStore.showSidebar && isDesktop"
            class="badge badge-soon"
          >
            Soon
          </div>
        </a>
        <a
          class="disabled is-flex is-align-items-center sidebar-link px-5 py-3"
          :class="{
            'is-justify-content-center': !utilsStore.showSidebar,
            'is-justify-content-space-between': utilsStore.showSidebar,
          }"
        >
          <div>
            <IcoNft />
            <span
              :class="{ 'bold-text': utilsStore.isDealList }"
              class="ml-3"
              v-if="utilsStore.showSidebar"
              >NFTs</span
            >
          </div>
          <div
            v-if="utilsStore.showSidebar && isDesktop"
            class="badge badge-soon"
          >
            Soon
          </div>
        </a>
        <!-- END PAGE LINK -->
      </div>
      <div class="has-text-centered mb-4">
        <div
          class="is-justify-content-center"
          :class="{
            'is-flex-column ': !utilsStore.showSidebar,
            'is-flex ': utilsStore.showSidebar,
          }"
        >
          <!-- <div>
            <a href="https://twitter.com/OnchainStorage" target="_blank"
              ><i class="mdi mdi-twitter" :class="{ 'mr-3': showSidebar }"></i
            ></a>
          </div> -->
          <div>
            <a
              href="https://github.com/protocol/onchain-storage"
              target="_blank"
              ><i
                class="mdi mdi-github"
                :class="{ 'mr-3': utilsStore.showSidebar }"
              ></i
            ></a>
          </div>
          <div>
            <a
              href="https://filecoinproject.slack.com/archives/C03CJKWP2DR"
              target="_blank"
              ><i class="mdi mdi-slack"></i
            ></a>
          </div>
        </div>
        <p v-if="utilsStore.showSidebar" class="mt-2">
          made with love by
          <a href="https://protocol.ai/" target="_blank"
            ><p style="text-decoration: underline">Protocol labs</p></a
          >
        </p>

        <div v-if="utilsStore.showSidebar" class="mt-3">
          <a class="has-text-centered" href="/#/retriev-terms-of-service"
            ><p style="text-decoration: underline">Retriev ToS</p>
          </a>
        </div>
        <div v-if="utilsStore.showSidebar">
          <a class="has-text-centered" href="/#/w3bounty-terms-of-service"
            ><p style="text-decoration: underline">W3bounty ToS</p>
          </a>
        </div>
        <div v-if="utilsStore.showSidebar">
          <a class="has-text-centered" href="/#/privacy-policy"
            ><p style="text-decoration: underline">Privacy Policy</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useUiUtils } from "@/stores/uiUtils";

import IcoProtocols from "@/components/elements/IcoProtocols.vue";
import IcoCreateDeal from "@/components/elements/IcoCreateDeal.vue";
import IcoDashboard from "@/components/elements/IcoDashboard.vue";
import IcoNft from "@/components/elements/IcoNft.vue";
import IcoTools from "@/components/elements/IcoTools.vue";
import checkViewport from "../mixins/checkViewport";
export default {
  name: "sidebar",
  mixins: [checkViewport],
  components: {
    IcoProtocols,
    IcoCreateDeal,
    IcoDashboard,
    IcoNft,
    IcoTools,
  },
  computed: {
    ...mapStores(useUiUtils),
  },
};
</script>

<style scoped>
a {
  text-decoration: none !important;
}
</style>
