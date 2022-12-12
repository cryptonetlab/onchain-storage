<template>
  <div>
    <p class="small mt-5 mb-2" style="font-weight: 500 !important">
      Deal Summary
    </p>
    <div class="custom-card border-primary-lighter">
      <div
        class="is-flex is-align-items-center is-justify-content-space-between py-4 px-3"
      >
        <p class="small">Deal duration</p>
        <p
          class="small"
          v-if="dealDurationDays !== undefined && dealDurationDays > 0"
        >
          <b>{{ dealDurationDays }} days</b>
        </p>
      </div>
      <div class="divider"></div>
      <div
        class="is-flex is-align-items-center is-justify-content-space-between py-4 px-3"
      >
        <p class="small">You are paying</p>
        <p
          class="small"
          v-if="dealValue !== undefined && parseInt(dealValue) > 0"
        >
          <b>{{ dealValue }} wei</b>
        </p>
        <p v-if="dealValue !== undefined && parseInt(dealValue) === 0">
          <b>free</b>
        </p>
      </div>
      <div class="divider"></div>
      <div
        class="is-flex is-align-items-center is-justify-content-space-between py-4 px-3"
      >
        <p class="small">Your Collateral</p>
        <p class="small">
          <b>{{ dealCollateral }} wei</b>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default {
  name: "retriev-recap-deal-dashboard",
  props: ["dealDurationDays", "dealValue", "dealCollateral"],
};
</script>
