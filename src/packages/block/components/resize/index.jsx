import { defineComponent } from "vue";
import "./index.less";
export default defineComponent({
  props: {
    block: {
      type: Object,
    },
    component: {
      type: Object,
    },
  },
  setup(props) {
    const { width, height } = props.component.resize || {};
    let data = {};
    const onMouseDown = (e, direction) => {
      e.stopPropagation();
      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width,
        startHeight: props.block.height,
        startLeft: props.block.left,
        startTop: props.block.top,
        direction,
      };
      document.body.addEventListener("mousemove", onMouseMove);
      document.body.addEventListener("mouseup", onMouseUp);
    };
    const onMouseMove = (e) => {
      // 移动位置
      let { clientX, clientY } = e;
      // 原有数据
      let {
        startX,
        startY,
        startWidth,
        startHeight,
        startLeft,
        startTop,
        direction,
      } = data;
      // 拖动水平中间点时， x轴不能变化
      if (direction.horizontal == "center") {
        clientX = startX;
      }
      // 拖动垂直中间点时，y轴不能变化
      if (direction.vertical == "center") {
        clientY = startY;
      }

      // 计算数据
      let durX = clientX - startX;
      let durY = clientY - startY;

      //解决顶部的三个点拖动时的异常,反方向则取反
      if (direction.vertical == "start") {
        durY = -durY;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = startTop - durY;
      }
      if (direction.horizontal == "start") {
        durX = -durX;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = startLeft - durX;
      }
      const width = startWidth + durX;
      const height = startHeight + durY;
      // 重置元素宽高
      // eslint-disable-next-line vue/no-mutating-props
      props.block.width = width;
      // eslint-disable-next-line vue/no-mutating-props
      props.block.height = height;
      // 添加一个标志，表示重置过元素宽高了
      // eslint-disable-next-line vue/no-mutating-props
      props.block.hasResize = true;
    };
    const onMouseUp = () => {
      document.body.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseup", onMouseUp);
    };
    return () => {
      return (
        <>
          {/* 如果width，则确定宽度可调整，渲染元素选中的可调整样式 */}
          {width && (
            <>
              <div
                class="resize left"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "start", vertical: "center" })
                }
                style={{
                  cursor: "w-resize",
                }}
              ></div>
              <div
                class="resize right"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "end", vertical: "center" })
                }
                style={{
                  cursor: "e-resize",
                }}
              ></div>
            </>
          )}
          {/* 如果height，则确定高度可调整，渲染元素选中的可调整样式 */}
          {height && (
            <>
              <div
                class="resize top"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "center", vertical: "start" })
                }
                style={{
                  cursor: "n-resize",
                }}
              ></div>
              <div
                class="resize bottom"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "center", vertical: "end" })
                }
                style={{
                  cursor: "s-resize",
                }}
              ></div>
            </>
          )}
          {/* width和height都有表示宽高皆可调整 */}
          {width && height && (
            <>
              <div
                class="resize top-left"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "start", vertical: "start" })
                }
                style={{
                  cursor: "nw-resize",
                }}
              ></div>
              <div
                class="resize top-right"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "end", vertical: "start" })
                }
                style={{
                  cursor: "ne-resize",
                }}
              ></div>
              <div
                class="resize bottom-left"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "start", vertical: "end" })
                }
                style={{
                  cursor: "sw-resize",
                }}
              ></div>
              <div
                class="resize bottom-right"
                onMousedown={(e) =>
                  onMouseDown(e, { horizontal: "end", vertical: "end  " })
                }
                style={{
                  cursor: "se-resize",
                }}
              ></div>
            </>
          )}
        </>
      );
    };
  },
});
