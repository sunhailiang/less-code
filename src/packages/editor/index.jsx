import { defineComponent, computed } from "vue";
import "./index.less";
import Block from "../block";
export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
  },
  setup(props) {
    const data = computed({
      get() {
        return props.modelValue;
      },
    });
    console.log("数据", data.value);
    // 画布数据
    const canvasStyle = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));

    return () => (
      <div class="editor">
        {/* 物料 */}
        <div className="left">左侧物料</div>
        {/* 菜单 */}
        <div className="top">顶部菜单</div>
        {/* 属性 */}
        <div className="right">组件属性</div>
        {/* 画布 */}
        <div className="editor-container">
          {/* 产生滚动条 */}
          <div className="canvas-container">
            {/* 画布内容 */}
            <div className="canvas" style={canvasStyle.value}>
              {data.value.blocks.map((block) => (
                // 渲染子组件
                <Block block={block} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
