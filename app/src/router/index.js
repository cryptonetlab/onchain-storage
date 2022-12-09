import Vue from "vue";
import VueRouter from "vue-router";

// App
import Dashboard from "../views/Dashboard.vue";
import MyDeals from "../views/MyDeals.vue";
import CreateDeal from "../views/CreateDeal.vue";
import CIDSpec from "../views/CIDSpec.vue";

// Landing Page
import Landing from "../views/Landing.vue";
import RetrievTOS from "../views/RetrievTOS.vue";
import W3BountyTOS from "../views/W3BountyTOS.vue";
import Privacy from "../views/Privacy.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/app",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/app/cid/:id",
    name: "cid-specs",
    component: CIDSpec,
  },
  {
    path: "/app/my-deals/:searcher",
    name: "deal-list",
    component: MyDeals,
  },
  {
    path: "/app/my-deals",
    name: "deal-list",
    component: MyDeals,
  },
  {
    path: "/app/deal-maker-tool",
    name: "create-deal",
    component: CreateDeal,
  },
  {
    path: "/",
    name: "landing",
    component: Landing,
  },
  {
    path: "/retriev-terms-of-service",
    name: "terms-retriev",
    component: RetrievTOS,
  },
  {
    path: "/w3bounty-terms-of-service",
    name: "terms-w3b",
    component: W3BountyTOS,
  },
  {
    path: "/privacy-policy",
    name: "privacy",
    component: Privacy,
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
