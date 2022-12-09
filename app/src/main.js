import Vue from "vue";
import App from "./App.vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import router from "./router";
import Buefy from "buefy";
import Gravatar from "vue-gravatar";
import Toast from "vue-toastification";

// Buefy
import "buefy/dist/buefy.css";

// Notification
import "vue-toastification/dist/index.css";

// App Stylesheet
import "animate.css";

// landing Stylesheet
import "./themes/landing/colors.scss";
import "./themes/landing/style.scss";
import "./themes/landing/responsive.scss";

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 20,
  newestOnTop: true,
});

Vue.use(Buefy);
Vue.component("v-gravatar", Gravatar);
Vue.config.productionTip = false;

new Vue({
  pinia,
  router,
  render: (h) => h(App),
}).$mount("#app");
