import { defineComponent, inject, onUnmounted } from "vue";
import bus from "@/utils/eventBus";
import events from "../editor-utils/left";

export default defineComponent({
  props: {
    container: {
      type: Object,
    },
    coreData: {
      type: Object,
    },
  },
  setup(props) {
    let config = inject("config");
    // 从物料区拖拽
    let { dragStart, dragEnd } = events(props);
    onUnmounted(() => {
      // 解绑事件监听
      bus.off("getCoreData");
    });
    return () => {
      return config.componentList.map((component) => (
        <div
          className="left-item"
          draggable
          onDragstart={(e) => dragStart(e, component)}
          onDragEnd={(e) => dragEnd(e, component)}
        >
          <span>{component.label}</span>
          <div>{component.preview()}</div>
        </div>
      ));
    };
  },
});
