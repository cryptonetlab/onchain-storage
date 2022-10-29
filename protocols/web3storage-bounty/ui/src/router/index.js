import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Terms from "../views/Terms.vue";
import Privacy from "../views/Privacy.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/terms-of-service",
    name: "Terms",
    component: Terms,
  },
  {
    path: "/privacy-policy",
    name: "Privacy",
    component: Privacy,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
