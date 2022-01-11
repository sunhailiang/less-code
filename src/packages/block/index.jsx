import { defineComponent, computed } from "vue";
import "./index.less";
export default defineComponent({
  props: {
    block: {
      type: Object,
    },
  },
  setup(props) {
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
    }));
    console.log("block", props);
    return () => (
      <div class="block" style={blockStyle.value}>
        代码块{" "}
      </div>
    );
  },
});
