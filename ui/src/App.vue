<template>
  <div id="app">
    <Demo />
  </div>
</template>

<script>
import Demo from "./components/Demo.vue";

export default {
  name: "App",
  components: { Demo },
};
</script>

<style>
/** 把网页的边界去掉 */
body {
  margin: 0;
  height: 100%;
}

/** 改变盒子模型 */
* {
  box-sizing: border-box;
}

html {
  height: 100%;
}

#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 0;
  width: 100%;
  height: 100%;
}
</style>
