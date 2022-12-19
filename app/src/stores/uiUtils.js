import { defineStore } from "pinia";

////////////////////////////////////////////////////////////
export const useUiUtils = defineStore("utils", {
  state: () => ({
    showSidebar: localStorage.getItem("showSidebar"),
    disabled: true,
  }),
  actions: {
    toggleSidebar() {
      const app = this;
      app.showSidebar = !app.showSidebar;
      if (app.showSidebar === true) {
        localStorage.setItem("showSidebar", true);
      } else {
        localStorage.setItem("showSidebar", false);
      }
    },
    // Notifications
    alertCustomError(message) {
      this.$buefy.dialog.alert({
        title: "Error",
        message: message,
        type: "is-danger",
        hasIcon: true,
        icon: "times-circle",
        iconPack: "fa",
        ariaRole: "alertdialog",
        ariaModal: true,
      });
    },
  },
});
