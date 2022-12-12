<template>
  <div>
    <div class="mt-4 mb-3">
      <p v-if="$route.name === 'create-deal'" class="">
        Click on the button below to confirm.
      </p>
    </div>
    <div
      class="mt-2"
      :class="{
        'is-flex is-align-items-center': $route.name === 'create-deal',
      }"
    >
      <div
        v-if="
          dealUri !== undefined &&
          dealUri.length > 0 &&
          $route.name !== 'create-deal'
        "
        class="mb-4"
      >
        <W3bRecapDeal />
      </div>
      <!-- <b-button @click="$emit('stepBack')" class="btn-ligh mr-4">Back</b-button> -->
      <b-button
        class="btn-primary"
        :disabled="isWorking"
        @click="createDealProposal()"
      >
        Create deal proposal
      </b-button>
    </div>

    <!-- RECAP DEAL  -->
    <div
      class="deal-summary column is-3"
      :class="{
        'is-3': !utilsStore.showSidebar,
        'is-2': utilsStore.showSidebar,
      }"
      style="transition: all 0.25s"
      v-if="
        dealUri !== undefined &&
        dealUri.length > 0 &&
        $route.name === 'create-deal'
      "
    >
      <h2 class="has-text-centered my-5">Deal Summary</h2>
      <div class="px-3">
        <RecapDeal :fileToUpload="fileToUpload" />
      </div>
    </div>
    <!-- END | RECAP DEAL -->

    <PendingTx
      :isCreatingDeal="isCreatingDeal"
      :activeStep="activeStep"
      :pendingTx="pendingTx"
      :receipt="receipt"
      @closeModalTx="closeModalTx()"
    />
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import { useUiUtils } from "@/stores/uiUtils";
import axios from "axios";
import PendingTx from "@/components/PendingTx.vue";
import RecapDeal from "@/components/web3-storage/RecapDeal.vue";
import W3bRecapDeal from "@/components/fast-create/W3bRecapDeal.vue";
const Web3Bounty = require("./abi.json");
export default {
  name: "web3storage",
  props: ["dealUri", "fileToUpload", "fileSize", "isMempool"],
  data() {
    return {
      abi: Web3Bounty,
      isWorking: false,
      confirmed: "",

      //tx modal
      activeStep: 0,
      isCreatingDeal: false,
      pendingTx: "",
      receipt: "",

      //memPool
      checkMempool: false,
    };
  },
  components: {
    RecapDeal,
    PendingTx,
    W3bRecapDeal,
  },
  computed: {
    ...mapStores(useWeb3Store),
    ...mapStores(useUiUtils),
  },

  mounted() {
    const app = this;
    console.log("W3BOUNTY_LOADED");
    app.checkMempool = app.isMempool;
  },
  methods: {
    async createDealProposal() {
      const app = this;
      if (app.dealUri !== "") {
        console.log("Files URI", app.dealUri);
        const contract = new app.web3Store.web3.eth.Contract(
          app.abi,
          app.web3Store.protocolsContracts.Web3Bounty
        );
        app.isCreatingDeal = true;
        app.activeStep = 0;
        app.isWorking = true;

        try {
          const dealers = [];
          const oracles = [];
          const duration = 60 * 60 * 24 * 365;

          const gasPrice = await app.web3Store.web3.eth.getGasPrice();
          const BN = app.web3Store.web3.utils.BN;
          const gp = new BN(gasPrice.toString());
          const doubled = gp.mul(new BN("2")).toString();

          // TODO: THIS IS FOR A TEST, MOVE "Send To mempool" after "creteDealProposal"

          // Send to MemPool
          // const sendMempool = await axios.post(app.apiMempool, {
          //   dealUri: app.dealUri,
          //   address: app.web3Store.account,
          //   duration: duration,
          // });
          // console.log("Response is", sendMempool);
          app.checkMempool = true;
          app.$emit("checkMempool", app.checkMempool);
          // END | Send to MemPool

          const receipt = await contract.methods
            .createDealProposal(app.dealUri, dealers, oracles, duration)
            .send({ from: app.web3Store.account, gasPrice: doubled })
            .on("transactionHash", (tx) => {
              // TODO: When API for Deal recap it's ready also for this protocol add the line below
              localStorage.setItem("pendingTx", tx);
              localStorage.setItem("pendingProtocol", "Web3Bounty");
              app.activeStep = 1;
              app.pendingTx = tx;
            });

          console.log("BLOCKCHAIN_RECEIPT ", receipt);
          app.receipt = receipt.blockHash;
          app.activeStep = 2;
          app.confirmed = app.dealUri.replace("ipfs://", "");
          app.$toast.clear();
          // setTimeout(function () {
          //   window.location.href = "/#/app/";
          // }, 3000);
        } catch (e) {
          app.$toast.clear();
          app.$emit("alert", e.message);
          app.isWorking = false;
          app.isCreatingDeal = false;
        }
      }
    },
    closeModalTx() {
      const app = this;
      app.isCreatingDeal = false;
      if (app.$route.name === "dashboard") {
        window.location.reload();
      }
    },
  },
};
</script>
