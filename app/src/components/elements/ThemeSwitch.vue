<template>
  <div>
    <div v-if="userTheme === 'light-theme'">
      <div class="btn-light-icon" @click="toggleTheme()">
        <i class="mdi mdi-moon-waning-crescent"></i>
      </div>
    </div>
    <div v-if="userTheme === 'dark-theme'">
      <div class="btn-light-icon" @click="toggleTheme()">
        <i class="mdi mdi-white-balance-sunny"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ThemeButton",
  mounted() {
    const initUserTheme = this.getTheme() || this.getMediaPreference();
    this.setTheme(initUserTheme);
  },

  data() {
    return {
      userTheme: "dark-theme",
    };
  },

  methods: {
    toggleTheme() {
      const activeTheme = localStorage.getItem("user-theme");
      if (activeTheme === "light-theme") {
        this.setTheme("dark-theme");
      } else {
        this.setTheme("light-theme");
      }
    },

    setTheme(theme) {
      localStorage.setItem("user-theme", theme);
      this.userTheme = theme;
      document.documentElement.className = theme;
    },

    getTheme() {
      return localStorage.getItem("user-theme");
    },

    getMediaPreference() {
      const hasDarkPreference = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (hasDarkPreference) {
        return "dark-theme";
      } else {
        return "light-theme";
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.toggle-theme {
  font-size: 1rem;
  color: white;
  cursor: pointer;
}
</style>
