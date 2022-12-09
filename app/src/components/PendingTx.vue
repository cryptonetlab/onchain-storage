<template>
  <div v-if="isCreatingDeal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header px-5">
        <div
          class="modal-header-button"
          @click="$emit('closeModalTx')"
          style="cursor: pointer"
        >
          <i class="mdi mdi-close"></i>
        </div>
        <h3><b>Deal Transaction</b></h3>
      </div>
      <div class="modal-content">
        <div class="pt-6">
          <b-steps
            v-model="activeStep"
            animated
            :rounded="false"
            :has-navigation="false"
          >
            <b-step-item
              type="is-info"
              step="1"
              icon-pack="mdi"
              icon="check"
              label="Approve"
            >
              <div class="py-6">
                <div class="icon-status">
                  <img width="100px" src="../assets/img/icon1.svg" alt="" />
                </div>
                <h2 class="mt-4">
                  Confirm the transaction<br />
                  in your wallet.
                </h2>
              </div>
            </b-step-item>

            <b-step-item
              type="is-info"
              step="2"
              label="Pending"
              icon-pack="mdi"
              icon="check"
            >
              <div class="py-6">
                <div class="icon-status">
                  <img width="100px" src="../assets/img/icon2.svg" alt="" />
                </div>
                <h2 class="mt-4 mb-4">
                  Creating your deal <br />
                  proposal, please wait...
                </h2>
                <a
                  class="color-light"
                  v-if="pendingTx !== undefined"
                  :href="web3Store.explorer + pendingTx"
                  style="
                    text-decoration: underline;
                    text-underline-offset: 4px;
                    font-weight: 400;
                  "
                  target="_blank"
                  >Pending transaction at:
                  {{ pendingTx.substr(0, 4) + "..." + pendingTx.substr(-4) }}</a
                >
                <div class="mt-4">
                  <a
                    v-if="$route.name !== 'dashboard'"
                    href="/#/app"
                    class="btn-primary"
                    style="text-decoration: none"
                    >Dashboard</a
                  >
                  <div
                    v-if="$route.name === 'dashboard'"
                    class="btn-primary"
                    style="text-decoration: none"
                    @click="$emit('closeModalTx')"
                  >
                    Dashboard
                  </div>
                </div>
              </div>
            </b-step-item>

            <b-step-item
              type="is-info"
              step="3"
              label="Completed"
              icon-pack="mdi"
              icon="check"
            >
              <div class="py-6">
                <div class="icon-status">
                  <img width="100px" src="../assets/img/icon3.svg" alt="" />
                </div>
                <h2 class="mt-4 mb-4">
                  Deal created <br />
                  successfully
                </h2>
                <p class="color-light" v-if="receipt !== undefined">
                  Your payment is completed.
                </p>
                <div class="mt-4 mb-2">
                  <a
                    v-if="$route.name !== 'dashboard'"
                    href="/#/app"
                    class="btn-primary"
                    style="text-decoration: none"
                    >Dashboard</a
                  >
                  <div
                    v-if="$route.name === 'dashboard'"
                    class="btn-primary"
                    style="text-decoration: none"
                    @click="$emit('closeModalTx')"
                  >
                    Dashboard
                  </div>
                </div>
                <a
                  style="
                    text-decoration: underline;
                    text-underline-offset: 4px;
                    font-weight: 400;
                  "
                  v-if="receipt !== undefined"
                  :href="web3Store.explorer + receipt"
                  target="_blank"
                  >View on explorer
                </a>
              </div>
            </b-step-item>
          </b-steps>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";

export default {
  props: ["isCreatingDeal", "activeStep", "pendingTx", "receipt"],
  computed: {
    ...mapStores(useWeb3Store),
  },
};
</script>
