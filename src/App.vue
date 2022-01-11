<template>
  <div class="lcdp">
    <Editor v-model="state" />
  </div>
</template>

<script>
import { ref } from "vue";
import coreData from "./data";
import Editor from "./packages/editor/index.jsx";
export default {
  components: {
    Editor,
  },
  setup() {
    // ref：建立响应式关系，监听数据变化
    const state = ref(coreData);
    return {
      state,
    };
  },
};
</script>

<style lang="less">
.lcdp {
  position: fixed;
  top: 20px;
  bottom: 20px;
  left: 20px;
  right: 20px;
}
</style>
