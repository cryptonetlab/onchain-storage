<template>
  <div>
    <div class="filters">
      <div class="field" style="position: relative; margin-top: 66px">
        <div class="control has-icons-left has-icons-right">
          <input
            class="input is-info p-4"
            type="text"
            placeholder=" Search provider"
            v-model="searcher"
          />
          <span class="icon is-medium is-left">
            <i class="mdi mdi-magnify"></i>
          </span>
        </div>
        <div
          v-if="searcher !== undefined && searcher.length !== 0"
          class="placeholder-input-search"
        >
          <i class="mdi mdi-close-circle pointer" @click="searcher = ''"></i>
        </div>
      </div>
      <div v-if="isFiltering" @click="resetFiler()" class="btn-secondary-icon">
        <i class="mdi mdi-close-circle mr-3"></i>Filter
      </div>
      <div class="mt-5">
        <!-- FILTER SIZE -->
        <div
          v-for="filter in filters"
          :key="filter.tipology"
          class="b-bottom-colored-grey pb-3"
        >
          <div
            @click="toggleFilter(filter)"
            class="is-flex is-align-items-center is-justify-content-space-between"
          >
            <h5>{{ filter.tipology }}</h5>
            <i
              v-if="filter.tipology !== isOpen"
              class="mdi mdi-chevron-down medium-font"
              aria-hidden="true"
            ></i>
            <i
              v-if="filter.tipology === isOpen"
              class="mdi mdi-chevron-up medium-font"
              aria-hidden="true"
            ></i>
          </div>
          <Transition name="slide">
            <div v-if="filter.tipology === isOpen">
              <div>
                <div
                  class="is-flex is-align-items-center is-justify-content-space-between"
                >
                  <div class="field m-0">
                    <div class="control pr-4">
                      <input
                        class="input is-info"
                        type="text"
                        placeholder=""
                        v-model="filter.min"
                      />
                    </div>
                  </div>
                  <p>to</p>
                  <div class="field m-0">
                    <div class="control px-4">
                      <input
                        class="input is-info"
                        type="text"
                        placeholder=""
                        v-model="filter.max"
                      />
                    </div>
                  </div>
                  <p>MB</p>
                </div>
                <b-button @click="isFiltering = true" class="btn-secondary mt-3"
                  >Apply</b-button
                >
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Filter",
  props: ["step"],
  data() {
    return {
      // FILTER
      searcher: "",
      isOpen: "",
      isFiltering: false,
      filters: [
        {
          tipology: "Size",
          min: "",
          max: "",
          open: false,
        },
        {
          tipology: "Payment",
          min: "",
          max: "",
          open: false,
        },
        {
          tipology: "Collateral",
          min: "",
          max: "",
          open: false,
        },
        {
          tipology: "Duration",
          min: "",
          max: "",
          open: false,
        },
      ],
    };
  },
  watch: {
    filters: {
      deep: true,
      handler() {},
    },
  },
  methods: {
    resetFiler() {
      const app = this;
      app.isFiltering = false;
      app.isOpen = "";
      app.filters = [
        {
          tipology: "Size",
          min: "",
          max: "",
          open: false,
        },
        {
          tipology: "Payment",
          min: "",
          max: "",
          open: false,
        },
        {
          tipology: "Collateral",
          min: "",
          max: "",
          open: false,
        },
        {
          tipology: "Duration",
          min: "",
          max: "",
          open: false,
        },
      ];
    },
    
    toggleFilter(filter) {
      const app = this;
      if (app.isOpen === filter.tipology) {
        app.isOpen = "";
      } else {
        app.isOpen = filter.tipology;
      }
      console.log(app.isOpen);
    },
  },
};
</script>
