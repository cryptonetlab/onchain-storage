<template>
  <div>
    <!-- Upload file -->
    <div style="position: relative; z-index: 2">
      <div class="custom-card border-primary-lighter p-2">
        <b-field v-if="!fileToUp.name">
          <b-upload
            v-model="fileToUp"
            expanded
            drag-drop
            :disabled="isWorking"
            type="is-info"
          >
            <section
              class="section"
              :class="{
                'p-6': $route.name === 'create-deal',
                'py-4 px-3': $route.name !== 'create-deal',
              }"
            >
              <div class="content has-text-centered">
                <div class="btn-tertiary mb-3">Choose file</div>
                <p :class="{ small: $route.name !== 'create-deal' }">
                  Or drag and drop <br />your files here
                </p>
              </div>
            </section>
          </b-upload>
        </b-field>
        <div
          class="bordered-dashed is-align-items-start is-justify-content-space-between "
          :class="{
            'is-flex-column p-3': $route.name !== 'create-deal',
            'is-flex is-flex-wrap-wrap py-6 px-4': $route.name === 'create-deal',
          }"
          v-if="fileToUp.name"
          style="position: relative"
        >
          <div
            class="top-right-pos2 pointer"
            v-if="fileToUp.name && $route.name !== 'create-deal'"
            @click="removeFileToUp()"
          >
            <i class="mdi mdi-close"></i>
          </div>
          <div :class="{ 'mb-3': !isDesktop }">
            <div
              class="is-align-items-center is-justify-content-space-between mb-3"
              :class="{
                'is-flex-column': $route.name !== 'create-deal',
                'is-flex': $route.name === 'create-deal',
              }"
            >
              <div :class="{ 'mb-3': $route.name !== 'create-deal' }">
                <h5 class="m-0">File name:</h5>
                <h5 class="break-word">
                  <b>{{ fileToUp.name }}</b>
                </h5>
              </div>
              <div>
                <h5 class="m-0">File size:</h5>
                <h5 class="break-word">
                  <b>{{ parseInt(fileToUp.size) / 1000 }}KB</b>
                </h5>
              </div>
            </div>

            <h5 class="m-0">Deal URI:</h5>
            <h5
              class="break-word"
              :class="{ 'mb-3': $route.name !== 'create-deal' }"
              v-if="fileUri"
            >
              <b v-if="$route.name !== 'create-deal'">{{
                fileUri.substr(0, 12) + "..." + fileUri.substr(-8)
              }}</b>
              <b v-if="$route.name === 'create-deal'">{{ fileUri }}</b>
            </h5>
            <h5 v-if="!fileUri">Calculating...</h5>
          </div>
          <b-button
            v-if="$route.name === 'create-deal'"
            class="btn-light mt-3"
            style="float: right"
            :disabled="!fileUri"
            @click="removeFileToUp()"
            ><i class="mdi mdi-close-circle"></i> Change file</b-button
          >
        </div>
      </div>
      <!-- add :disabled="!fileToUp.name" to the button below-->
    </div>
    <!-- Select Protocol -->
  </div>
</template>

<script>
import axios from "axios";
import { mapStores } from "pinia";
import { useUiUtils } from "@/stores/uiUtils";

import checkViewport from "@/mixins/checkViewport";
const FormData = require("form-data");

export default {
  name: "UploadFile",
  mixins: [checkViewport],
  props: ["isWorking", "expertMode", "step", "fileToUpload"],
  data() {
    return {
      isUploadingIPFS: false,
      canDoProposal: true,
      fileToUp: {},
      fileUri: "",
    };
  },
  computed: {
    ...mapStores(useUiUtils),
  },
  mounted() {
    const app = this;
    app.fileToUp = app.fileToUpload;
  },
  watch: {
    fileToUp() {
      this.uploadFile();
    },
  },
  methods: {
    async uploadFile() {
      const app = this;
      if (app.fileToUp.name && !app.isUploadingIPFS) {
        app.$emit("notification", "Uploading file on IPFS, please wait..");
        app.isUploadingIPFS = true;
        app.canDoProposal = true;
        const formData = new FormData();
        formData.append("file", app.fileToUp);
        formData.append("address", app.account);
        console.log("UPLOADED_FILE", app.fileToUp);
        console.log("Size of FILE is: ", app.fileToUp.size);
        // TODO: Unify upload to onchain.storage
        axios({
          method: "post",
          url: process.env.VUE_APP_API_URL_RETRIEV + "/upload",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data;",
          },
        }).then(function (response) {
          if (response.data.cid !== undefined) {
            app.fileUri = "ipfs://" + response.data.cid;
            app.isUploadingIPFS = false;
            app.$toast.clear();
            console.log("uploaded correctly");
            // app.$emit("check-file", app.fileToUp, app.fileUri);
            app.$emit("check-file", {
              isFile: app.fileToUp,
              isURI: app.fileUri,
            });
          } else {
            app.$emit("alert", "Error while uploading file, please retry!");
          }
        });
      }
    },
    removeFileToUp() {
      const app = this;
      app.fileToUp = {};
      app.fileUri = "";
      app.$emit("remove-file");
    },
  },
};
</script>
