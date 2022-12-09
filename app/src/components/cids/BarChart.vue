<template>
  <LineChartGenerator v-if="loaded"
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
  />
</template>

<script>
import { Line as LineChartGenerator } from "vue-chartjs/legacy";
import axios from "axios";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler
);

export default {
  name: "LineChart",
  components: {
    LineChartGenerator,
  },
  props: {
    chartId: {
      type: String,
      default: "line-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 385,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Object,
      default: () => {},
    },
    cid: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loaded: false,
      api: process.env.VUE_APP_API_URL_RETRIEV,
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Deal value",
            borderColor: "#638FF7",
            borderWidth: 1,
            backgroundColor: (ctx) => {
              const canvas = ctx.chart.ctx;
              const gradient = canvas.createLinearGradient(0, 0, 0, 400);

              gradient.addColorStop(0, "#D2DFFF");
              gradient.addColorStop(0.5, "#e5edff");
              gradient.addColorStop(1, "white");

              return gradient;
            },
            data: [],
            fill: true,
            fillColor: "rgba(220,220,220,0.5)",
          },
        ],
      },

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: false,
            title: {
              display: true,
              text: "Month",
            },
          },
          y: {
            display: false,
            stacked: true,
            title: {
              display: true,
              text: "Value",
            },
          },
        },
        // plugins: {
        //   legend: {
        //     display: false,
        //   },
        // },
        elements: {
          line: {
            tension: 0,
          },
        },
      },
    };
  },
  mounted() {
    this.fetchChartInfo();
  },
  methods: {
    async fetchChartInfo() {
      const app = this;
      let stats = await axios.get(
        app.api + "/stats/tvl-" + app.$route.params.id
      );
      for (let i in stats.data) {
        const stat = stats.data[i];
        app.chartData.labels.push(stat.day);
        app.chartData.datasets[0].data.push(stat.value);
      }
      app.loaded = true
    },
  },
};
</script>
