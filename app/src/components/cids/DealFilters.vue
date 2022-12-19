<template>
  <div class="is-flex is-align-items-center">
    <!-- STATUS FILTER -->
    <div class="custom_filters mr-4">
      <div
        class="custom_dropdown__face"
        @click="filterStatus = !filterStatus"
        :style="[
          filterStatus
            ? {
                borderBottom: 'none',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }
            : { top: '0px' },
        ]"
      >
        <div class="custom_dropdown__text is-flex is-align-items-center">
          <p><b>All</b></p>
          <IcoChevronRight class="ml-2" v-if="!filterStatus" />
          <IcoChevronDown class="ml-2" v-if="filterStatus" />
        </div>
      </div>
      <Transition
        name="custom-fade"
        enter-active-class="fade-in-top"
        leave-active-class="fade-out-top"
      >
        <ul
          style="z-index: 999"
          v-if="filterStatus"
          class="custom_dropdown__items"
        >
          <li @click="$emit('filterActive')">
            <span> Active</span>
          </li>
          <li @click="$emit('filterAll')">
            <span> All</span>
          </li>
          <li @click="$emit('filterEnded')">
            <span> Ended</span>
          </li>
        </ul>
      </Transition>
    </div>
    <!-- END STATUS FILTER -->

    <!-- TIME FILTER -->
    <div class="custom_filters mr-4" style="min-width: 100px">
      <div
        class="custom_dropdown__face"
        @click="showFilterTime = !showFilterTime"
        :style="[
          showFilterTime
            ? {
                borderBottom: 'none',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }
            : { top: '0px' },
        ]"
      >
        <div class="custom_dropdown__text is-flex is-align-items-center">
          <p>
            <b>{{ filteringForTime }}</b>
          </p>
          <IcoChevronRight class="ml-2" v-if="!showFilterTime" />
          <IcoChevronDown class="ml-2" v-if="showFilterTime" />
        </div>
      </div>
      <Transition
        name="custom-fade"
        enter-active-class="fade-in-top"
        leave-active-class="fade-out-top"
      >
        <ul
          style="z-index: 999"
          v-if="showFilterTime"
          class="custom_dropdown__items"
        >
          <li @click="$emit('filterTime', 7), (filteringForTime = 'Last Week')">
            <span> Last Week</span>
          </li>
          <li
            @click="$emit('filterTime', 31), (filteringForTime = 'Last Month')"
          >
            <span> Last Month</span>
          </li>
          <li
            @click="$emit('filterTime', 365), (filteringForTime = 'Last Year')"
          >
            <span> Last Year</span>
          </li>
          <li @click="$emit('filterTime', 1), (filteringForTime = 'Today')">
            <span> Today</span>
          </li>
        </ul>
      </Transition>
    </div>
    <!-- END TIME FILTER -->

    <!-- COSTS FILTER -->
    <!-- <div class="custom_filters">
      <div
        class="custom_dropdown__face"
        @click="filterCosts = !filterCosts"
        :style="[
          filterCosts
            ? {
                borderBottom: 'none',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }
            : { top: '0px' },
        ]"
      >
        <div class="custom_dropdown__text is-flex is-align-items-center">
          <IcoGreater class="mr-2" />
          <p><b>$10</b></p>
        </div>
      </div>
      <Transition
        name="custom-fade"
        enter-active-class="fade-in-top"
        leave-active-class="fade-out-top"
      >
        <ul
          style="z-index: 999"
          v-if="filterCosts"
          class="custom_dropdown__items"
        >
          <li v-for="net in 3" :value="net" :key="net">
            <span> Test</span>
          </li>
        </ul>
      </Transition>
    </div> -->
    <!-- END COSTS FILTER -->
  </div>
</template>

<script>
import IcoChevronRight from "@/components/elements/IcoChevronRight.vue";
import IcoChevronDown from "@/components/elements/IcoChevronDown.vue";
import IcoGreater from "@/components/elements/IcoGreater.vue";

export default {
  data() {
    return {
      filterStatus: false,
      showFilterTime: false,
      filterCosts: false,
      filteringForTime: "Last Year",
    };
  },
  components: {
    IcoChevronDown,
    IcoChevronRight,
    IcoGreater,
  },
  mounted() {
    // const app = this;
    // app.$emit("filterTime", 365);
    // app.filteringForTime = "Last Year";
  },
};
</script>
