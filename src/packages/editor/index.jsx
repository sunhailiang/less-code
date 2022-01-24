import { defineComponent, computed, ref } from "vue";
import "./index.less";
import Block from "../block";
import Left from "./left";
import Top from "./top";
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
    //预览功能：预览时，画布不允许编辑，也样式内容，基本输入功能体验
    const preview = ref(false);
    //完成编辑,直接退出画布状态，完成当前页面编辑
    const editorComplete = ref(false);
    // 监听左侧物料拖拽释放后最新的组件数据
    bus.on("getCoreData", (res) => {
      data.value = res;
    });
    // 画布上选中元素
    const {
      onContextMenuBlock,
      blockMousedown,
      canvasMousedown,
      focusData,
      markLine,
      mousdown,
      lastSelectBlock,
      clearBlocksFocus,
    } = events(data, preview, (e) => {
      console.log("获取选中的元素", focusData.value.focused);
      console.log("最后返回谁？", lastSelectBlock);
      console.log("参考线", markLine);
      //选中后开始拖拽
      mousdown(e);
    });
    // 自由拖拽画布上的元素

    // 画布数据
    const canvasStyle = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
      background: data.value.container.background,
    }));
    const containerRef = ref(null);
    return () =>
      editorComplete.value ? (
        <>
          {/* 画布内容 */}
          <div class="canvas" style={canvasStyle.value} ref={containerRef}>
            {data.value.blocks.map((block) => (
              // 渲染子组件
              <Block block={block} class={"editor-preview"} />
            ))}
            <ElButton
              type="primary"
              onClick={() => (editorComplete.value = false)}
            >
              继续编辑
            </ElButton>
          </div>
        </>
      ) : (
        <div class="editor">
          {editorComplete.value.done}

          {/* 物料 */}
          <div class="left">
            <Left container={containerRef} coreData={data} />
          </div>
          {/* 菜单 */}
          <div class="top">
            <Top
              coreData={data}
              focusData={focusData.value}
              preview={preview}
              clearBlocksFocus={clearBlocksFocus}
              editorComplete={editorComplete}
            />
          </div>
          {/* 属性 */}
          <div class="right">组件属性</div>
          {/* 画布 */}
          <div class="editor-container">
            {/* 产生滚动条 */}
            <div class="canvas-container">
              {/* 画布内容 */}
              <div
                class="canvas"
                style={canvasStyle.value}
                ref={containerRef}
                onMousedown={(e) => canvasMousedown(e)}
              >
                {data.value.blocks.map((block, index) => (
                  // 渲染子组件
                  <Block
                    block={block}
                    onMousedown={(e) => blockMousedown(e, block, index)}
                    // 选中加个样式
                    class={block.focus ? "editor-block-focus" : ""}
                    class={preview.value ? "editor-preview" : ""}
                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                  />
                ))}
                {
                  /* x辅助线 */
                  markLine.x !== null && (
                    <div
                      class="line-x"
                      style={{ left: markLine.x + "px" }}
                    ></div>
                  )
                }
                {
                  /* y辅助线 */
                  markLine.y !== null && (
                    <div
                      class="line-y"
                      style={{ top: markLine.y + "px" }}
                    ></div>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      );
  },
});
