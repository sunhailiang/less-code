import { defineComponent, computed, ref } from "vue";
import "./index.less";
import Block from "../block";
import Left from "./left";
import deepcopy from "deepcopy";
import bus from "@/utils/eventBus";
import events from "./editor-utils/editor";

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newVal) {
        // 提交最新的核心数据
        ctx.emit("update:modelValue", deepcopy(newVal));
      },
    });

    // 监听左侧物料拖拽释放后最新的组件数据
    bus.on("getCoreData", (res) => {
      data.value = res;
    });

    // 画布上选中元素
    const { blockMousedown } = events(data);
    // 自由拖拽画布上的元素

    // 画布数据
    const canvasStyle = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));
    const containerRef = ref(null);
    return () => (
      <div class="editor">
        {/* 物料 */}
        <div class="left">
          <Left container={containerRef} coreData={data} />
        </div>
        {/* 菜单 */}
        <div class="top">顶部菜单</div>
        {/* 属性 */}
        <div class="right">组件属性</div>
        {/* 画布 */}
        <div class="editor-container">
          {/* 产生滚动条 */}
          <div class="canvas-container">
            {/* 画布内容 */}
            <div class="canvas" style={canvasStyle.value} ref={containerRef}>
              {data.value.blocks.map((block) => (
                // 渲染子组件
                <Block
                  block={block}
                  onMousedown={(e) => blockMousedown(e, block)}
                  // 选中加个样式
                  class={block.focus ? "editor-block-focus" : ""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
