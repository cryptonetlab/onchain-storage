<template>
  <div id="app">
    <br />
    <router-view style="padding-bottom: 60px" />
    <div
      style="
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #000;
        font-size: 15px;
        padding-bottom: 5px;
        padding-top: 5px;
      "
    >
      <div class="is-flex is-justify-content-center">
        <p>Developed with ❤️ by</p>
        <a class="ml-3" href="https://protocol.ai" target="_blank"
          >Protocol Labs</a
        >
        <p class="ml-3">|</p>
        <a class="ml-3" href="/#/terms-of-service">Terms of service</a>
        <p class="ml-3">|</p>
        <a class="ml-3" href="/#/privacy-policy">Privacy Policy</a>
      </div>
    </div>
  </div>
</template>

<style>
.table thead td,
.table thead th {
  color: #fff !important;
  text-align: center !important;
}
.table {
  background-color: #010101 !important;
  color: #fff !important;
  font-size: 16px !important;
  border: 1px solid #fff !important;
}
.select select {
  background: #000 !important;
  color: #fff !important;
  font-family: "VT323", monospace !important;
}
.button {
  font-family: "VT323", monospace;
  font-size: 20px !important;
}
#app {
  font-family: "VT323", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  background: #121212;
  min-height: 100vh;
  font-size: 25px;
}
.label {
  color: #fff !important;
  text-align: left !important;
}
.title {
  color: #fff !important;
}
pre {
  border-radius: 10px;
  background: #444 !important;
  color: #fff !important;
}
.button {
  background: #444 !important;
  color: #fff !important;
  border-color: #fff !important;
}
.input,
textarea {
  background-color: transparent !important;
  border-bottom: 1px solid #fff;
  border-radius: 0px !important;
  border-top: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  text-align: left !important;
  color: #fff !important;
}
.textarea {
  border-left: 1px solid #fff !important;
  color: #fff !important;
  border-bottom: 0 !important;
  text-align: left !important;
}

.network-container {
  position: absolute;
  width: 150px;
  height: auto;
  right: 20px;
  top: 20px;
}

.secondary-color {
  color: #8fffab;
}
.error-color {
  color: #cc3d3d;
}
</style>
