<template>
  <div>
    <div>
      <div class="custom-card" :class="{ pointer: !isOpen }">
        <div class="card-header p-0 is-justify-content-space-between">
          <div class="is-flex is-align-items-center">
            <div>
              <h4
                class="px-4"
                style="
                  cursor: pointer;
                  text-decoration: underline;
                  width: 110px;
                "
              >
                <span>{{ user.substr(0, 4) + "..." + user.substr(-4) }}</span>
              </h4>
            </div>
            <div @click="copyToClipboard()" class="ml-3">
              <IcoCopy />
            </div>
            <div v-if="isDesktop" class="ml-6">
              <p>Time Left: {{ secondsToD(longestDeal / 1000) }}</p>
            </div>
          </div>

          <!-- Deal action bar -->
          <div class="is-flex is-align-items-center is-flex-wrap-wrap">
            <!-- BADGES -->
            <div
              v-for="protocol in protocols"
              :key="protocol"
              class="badge-protocol ml-3"
            >
              <span style="text-transform: uppercase">
                <b>{{ protocol.split("-")[1].toString() }}</b></span
              >
            </div>

            <!-- END BADGES -->

            <div class="ml-3 mr-3"></div>
            <div class="mr-3 p-3 pointer" @click="isOpen = !isOpen">
              <IcoChevronRight v-if="!isOpen" />
              <IcoChevronDown v-if="isOpen" />
            </div>
          </div>
          <!-- Deal action bar -->
        </div>

        <!-- DEAL SPECIFICATIONS -->
        <Transition name="slide">
          <div class="px-3 pb-3" v-show="isOpen">
            <div class="columns is-mobile is-multiline">
              <!-- Single Deal -->
              <div
                v-for="(deal, index) in deals"
                :key="index"
                class="column is-full-tablet is-half-desktop"
              >
                <div class="custom-card bg-low-contrast border-primary-lighter">
                  <div
                    class="is-flex is-align-items-center is-justify-content-space-between px-3 py-3"
                  >
                    <h4 style="text-transform: capitalize">
                      {{
                        deal.protocol.split("-")[0] +
                        " " +
                        "(" +
                        "deal" +
                        "  #" +
                        deal.deal_index +
                        ")"
                      }}
                    </h4>
                    <a
                      style="text-decoration: none"
                      v-if="deal.protocol.split('-')[0] === 'retriev'"
                      href="https://retriev.org"
                      target="_blank"
                      class="btn-lighter"
                      >Manage App</a
                    >
                    <a
                      v-if="deal.protocol.split('-')[0] === 'web3bounty'"
                      style="text-decoration: none"
                      href="https://web3bounty.app/"
                      target="_blank"
                      class="btn-lighter"
                      >Manage App</a
                    >
                  </div>
                  <div class="divider"></div>
                  <div
                    class="is-flex is-align-items-center is-justify-content-space-between px-3 py-2"
                  >
                    <p>Deal Value:</p>
                    <p>
                      <b>{{ deal.value }} wei</b>
                    </p>
                  </div>
                  <div class="divider"></div>
                  <div
                    v-if="deal.provider.length > 0"
                    class="is-flex is-align-items-center is-justify-content-space-between px-3 py-2"
                  >
                    <p>Time Left:</p>
                    <p v-if="parseInt(deal.left) > 0">
                      <b>{{ secondsToD(parseInt(deal.left) / 1000) }}</b>
                    </p>
                    <p v-if="parseInt(deal.left) === 0">
                      <b>Expired</b>
                    </p>
                  </div>
                  <div
                    v-if="deal.provider.length === 0"
                    class="is-flex is-align-items-center is-justify-content-space-between px-3 py-2"
                  >
                    <p>Time Left:</p>
                    <p><b>N/A</b></p>
                  </div>
                  <div class="divider"></div>
                  <div
                    class="is-flex is-align-items-center is-justify-content-space-between px-3 py-2"
                  >
                    <p>Provider</p>
                    <p
                      v-if="
                        web3Store.providerEndpoints[
                          deal.provider.toLowerCase()
                        ] && deal.provider.length > 0
                      "
                    >
                      <b>{{
                        web3Store.providerEndpoints[deal.provider.toLowerCase()]
                      }}</b>
                    </p>
                    <p v-else><b>N/A</b></p>
                  </div>
                </div>
              </div>
              <!-- END | Single Deal -->
            </div>
          </div>
        </Transition>
        <div class="divider"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useWeb3Store } from "@/stores/web3Store";
import checkViewport from "@/mixins/checkViewport";

import IcoCopy from "@/components/elements/IcoCopy.vue";
import IcoChevronRight from "@/components/elements/IcoChevronRight.vue";
import IcoChevronDown from "@/components/elements/IcoChevronDown.vue";

export default {
  name: "cdis-list",
  props: ["user", "deals", "protocols"],
  mixins: [checkViewport],
  components: {
    IcoCopy,
    IcoChevronDown,
    IcoChevronRight,
  },

  data() {
    return {
      isOpen: false,
      longestDeal: 0,
    };
  },
  computed: {
    ...mapStores(useWeb3Store),
  },
  mounted() {
    const app = this;
    for (let k in app.deals) {
      if (parseInt(app.deals[k].left) > parseInt(app.longestDeal)) {
        app.longestDeal = parseInt(app.deals[k].left);
      }
    }
  },
  methods: {
    async toggleDeal() {
      const app = this;
      console.log("isOpen start", app.isOpen);
      if (app.isOpen === app.deal.index) {
        app.isOpen = -1;
      } else {
        app.isOpen = app.deal.index;
        console.log("Opening deal", app.isOpen);
      }
    },

    secondsToD(seconds) {
      seconds = Number(seconds);
      var d = Math.floor(seconds / (3600 * 24));
      var h = Math.floor((seconds % (3600 * 24)) / 3600);
      var dDisplay = d > 0 ? d + (d == 1 ? " day" : " days") : "";
      var hDisplay = h > 0 ? ", " + h + (h == 1 ? " hour" : " hours") : "";

      return dDisplay + hDisplay;
    },

    copyToClipboard() {
      const app = this;
      if (app.$route.params.id) {
        let copyText = app.user;
        navigator.clipboard.writeText(copyText).then(() => {
          // Alert the user that the action took place.
          // Nobody likes hidden stuff being done under the hood!
          console.log("Copied to Clipboard");
        });
      } else {
        console.log("Nothing to copy, make sure that you're connected!");
      }
    },
  },
};
</script>
