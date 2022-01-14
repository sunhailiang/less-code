<template>
  <div class="lcdp">
    <Editor v-model="state" />
  </div>
</template>

<script>
import { ref, provide } from "vue";
import coreData from "./data";
import Editor from "./packages/editor/index.jsx";
import EditorConfig from "./utils/editor-config";
export default {
  components: {
    Editor,
  },
  setup() {
    // ref：建立响应式关系，监听数据变化
    const state = ref(coreData);
    // 注入组件配置,在用到的地方随时可取
    provide("config", EditorConfig);
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
