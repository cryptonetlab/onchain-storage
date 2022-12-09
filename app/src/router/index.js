import Vue from "vue";
import VueRouter from "vue-router";

// Landing Page
import Landing from "../views/Landing.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "landing",
    component: Landing,
  },
];

export const routesSpecs = {
  landing: {
    excludeAutoConnect: true,
  },
  "terms-w3b": {
    excludeAutoConnect: true,
  },
  "terms-retriev": {
    excludeAutoConnect: true,
  },
  privacy: {
    excludeAutoConnect: true,
  },
};

const router = new VueRouter({
  routes,
  scrollBehavior: function (to) {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

export default router;
