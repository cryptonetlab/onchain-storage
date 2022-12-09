<template>
  <!-- MOBILE BLOCKER DAPP -->
  <div v-if="isMobile" class="mobile-blocker">
    <div class="logo mb-3">
      <img src="../../assets/img/logo-light.svg" alt="" />
    </div>
    <h2 class="pay-off tertiary-color">Onchain.Storage</h2>
    <p class="has-text-centered mt-2">
      For a better experience, use dApp from Desktop.
    </p>
  </div>
  <!-- END MOBILE BLOCKER DAPP -->
</template>

<script>
import checkViewport from '../../mixins/checkViewport'

export default {
    name: "mobile-blocker",
    mixins: [checkViewport]
}
</script>
