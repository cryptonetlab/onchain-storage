<template>
  <div class="sidebar b-left-light">
    <div class="" style="height: 100%; padding: 2rem 1.4rem">
      <!-- <div v-if="isMempool"><MemPool :isMempool="isMempool" /></div> -->
      <div
        class="title-sidebar has-text-centered mb-4"
        :class="{
          'disabled-card': !web3Store.connected || web3Store.isLoadingState,
        }"
      >
        Store via the chain
      </div>
      <UploadFile
        :class="{
          'disabled-card': !web3Store.connected || web3Store.isLoadingState,
        }"
        :fileToUpload="fileToUpload"
        @check-file="checkFileUpload($event)"
        @remove-file="removeFile()"

        @alert="alertCustomError($event)"
      />
      <!-- Select the protocol -->
      <div v-if="dealUri">
        <p class="small mt-4 mb-2" style="font-weight: 500 !important">
          Select the protocol
        </p>
        <SelectProtocol
          :service="service"
          :dealUri="dealUri"
          @checkService="checkService($event)"
        />
      </div>

      <!-- Retrieval Pinning Protocol -->
      <div v-if="service === 'retrieval_pinning'">
        <RetrievNewDeal
          :dealUri="dealUri"
          :fileSize="fileSize"
          :fileToUpload="fileToUpload"
          :isMempool="isMempool"
          @alert="alertCustomError($event)"
          @checkMempool="checkMempool($event)"
        />
      </div>
      <!-- END | Retrieval Pinning Protocol -->

      <!-- Web3Bounty Protocol -->
      <div v-if="service === 'web3bounty'">
        <Web3BountyNewDeal
          :dealUri="dealUri"
          :fileToUpload="fileToUpload"
          :fileSize="fileSize"
          :isMempool="isMempool"
          @alert="alertCustomError($event)"
          @checkMempool="checkMempool($event)"
        />
      </div>
      <!-- END | Web3Bounty Protocol -->
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";

import checkViewport from "../../mixins/checkViewport";
import UploadFile from "@/components/UploadFile.vue";
import SelectProtocol from "@/components/fast-create/SelectProtocol.vue";
import MemPool from "@/components/MemPool.vue";

// Importing Protocol's create deals
import RetrievNewDeal from "@/components/retrieval-pinning/RetrievNewDeal.vue";
import Web3BountyNewDeal from "@/components/web3-storage/Web3BountyNewDeal.vue";

export default {
  name: "fast-create",
  mixins: [checkViewport],
  components: {
    MemPool,
    UploadFile,
    SelectProtocol,
    RetrievNewDeal,
    Web3BountyNewDeal,
  },
  data() {
    return {
      isMempool: false,
      fileSize: 0,
      dealUri: "",
      fileToUpload: {},
      service: "",
      // NOTIFICATIONS
      isToasting: false,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
  },
  methods: {
    // ========================================> UPLOADING FILE FUNCTIONS <========================================
    checkFileUpload({ isFile, isURI }) {
      const app = this;
      app.fileToUpload = isFile;
      app.dealUri = isURI;

      console.log("pass FILE from child", app.fileToUpload);
      console.log("pass DEAL URI from child", app.dealUri);

      app.fileSize = app.fileToUpload.size;
    },
    removeFile() {
      const app = this;
      app.fileToUpload = {};
      app.dealUri = "";
      app.fileSize = 0;
      app.service = "";
    },
    // ======================================> END | UPLOADING FILE FUNCTIONS <====================================

    // ==============================================> NOTIFICATION <==============================================

    alertCustomError(message) {
      this.$buefy.dialog.alert({
        title: "Error",
        message: message,
        type: "is-danger",
        hasIcon: true,
        icon: "times-circle",
        iconPack: "fa",
        ariaRole: "alertdialog",
        ariaModal: true,
      });
    },
    // ===========================================> END | NOTIFICATION <===========================================

    // ========================================> SELECT PROTOCOL <========================================
    checkService(service) {
      const app = this;
      app.service = service;
      console.log("pass PROTOCOL from child", app.service);
    },

    // ========================================> CHECK MEMPOOL <========================================
    checkMempool(isMempool) {
      const app = this;
      app.isMempool = isMempool;
      console.log("pass MEMPOOL from child", app.isMempool);
    },
  },
};
</script>
