import { computed, ref, reactive } from "vue";
import { events } from "./events";
import { $Dropdown } from "@/components";

export default function editorEvent(data, preview, callback) {
  // 参考线开始=====
  let selectIndex = ref(-1); // 默认没有选中的
  // 选中的最后一个组件
  let lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);

  let markLine = reactive({
    x: null,
    y: null,
  });

  // 参考线结束=====

  // 确认哪些选中，那些没选中
  const focusData = computed(() => {
    let focused = [];
    let unfocused = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focused : unfocused).push(block)
    );
    return { focused, unfocused };
  });

  // 清空其他选中样式
  const clearBlocksFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };

  // 鼠标按下拖拽开始=====
  // 拖拽时状态信息
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false, // 默认不是正在拖拽
  };
  // 鼠标按下
  const mousdown = (e) => {
    // 最后拖拽的元素微博是
    const { width: Bwidth, height: Bheight } = lastSelectBlock.value;

    //鼠标按下同步坐标信息
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left, // 拖拽前的位置
      startTop: lastSelectBlock.value.top,
      dragging: false, // 解决画布撤销，前进操作，
      startPositon: focusData.value.focused.map(({ top, left }) => ({
        top,
        left,
      })),
      lines: (() => {
        // A:参考元素
        // B:拖拽元素
        // 获取没选中的，每个元素都可能成为参考对象
        const { unfocused } = focusData.value;
        // 计算横线位置用y来存放，竖线的位置用x存放
        let lines = { x: [], y: [] };
        [
          ...unfocused,
          {
            // 画布参考线
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          // 获取每个元素位置，宽高
          const {
            top: Atop,
            left: Aleft,
            width: Awidth,
            height: Aheight,
          } = block;
          //纵向：B元素拖拽到和A元素高度一致时，显示辅助线
          // 情况一：顶对顶
          lines.y.push({ showTop: Atop, top: Atop });
          // 情况二：底对顶
          lines.y.push({ showTop: Atop, top: Atop - Bheight });
          // 情况三：x轴中对中
          lines.y.push({
            showTop: Atop + Aheight / 2,
            top: Atop + Aheight / 2 - Bheight / 2,
          });
          // 情况四：顶对底
          lines.y.push({ showTop: Atop + Aheight, top: Atop + Aheight });
          // 情况五：底对底
          lines.y.push({
            showTop: Atop + Aheight,
            top: Atop + Aheight - Bheight,
          });
          // 横向
          // 情况一：左对左
          lines.x.push({ showLeft: Aleft, left: Aleft });
          // 情况二：左对右
          lines.x.push({ showLeft: Aleft + Awidth, left: Aleft + Awidth });
          // 情况三：y轴中对中
          lines.x.push({
            showLeft: Aleft + Awidth / 2,
            left: Aleft + Awidth / 2 - Bwidth / 2,
          });
          // 情况四：右对右
          lines.x.push({
            showLeft: Aleft + Awidth,
            left: Aleft + Awidth - Bwidth,
          });
          // 情况五 ：
          lines.x.push({ showLeft: Aleft, left: Aleft - Bwidth });
        });
        return lines;
      })(),
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  // 按下移动
  const mousemove = (e) => {
    // 发布拖拽状态-同步撤销和重做的状态
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit("dragStart");
    }
    let { clientX: moveX, clientY: moveY } = e;

    // 参考线开始======
    // 计算当前元素的最新的left，去线里面匹配，找到了，就显示出
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;
    // y轴：计算横线显示的时机，小于等于5像素时，出现参考线
    let y = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i];
      // 距离元素小于5的时候说明接近元素了
      if (Math.abs(t - top) < 5) {
        // 横线出的位置
        y = s;
        // 靠近参考元素时吸附效果
        moveY = dragState.startY - dragState.startTop + t; // 拖拽距离减去开始距离+加上吸附5像素～
        break; // 找到参考线即退出
      }
    }
    // x轴：计算竖线显示的时机，小于等于5像素时，出现参考线
    let x = null;
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: sl } = dragState.lines.x[i];
      // 距离元素小于5的时候说明接近元素了
      if (Math.abs(l - left) < 5) {
        // 横线出的位置
        x = sl;
        // 靠近参考元素时吸附效果
        moveX = dragState.startX - dragState.startLeft + l; // 拖拽距离减去开始距离+加上吸附5像素～
        break;
      }
    }
    // 响应式更新参考线位置
    markLine.y = y;
    markLine.x = x;
    // 参考线结束=====
    // 计算选中元素的移动距离
    let durX = moveX - dragState.startX;
    let durY = moveY - dragState.startY;
    focusData.value.focused.forEach((block, idx) => {
      block.top = dragState.startPositon[idx].top + durY;
      block.left = dragState.startPositon[idx].left + durX;
    });
  };
  // 鼠标抬起
  const mouseup = () => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);

    // 鼠标抬起后参考线消失
    markLine.y = null;
    markLine.x = null;

    // 发布拖拽状态-同步撤销和重做的状态
    if (dragState.dragging) {
      events.emit("dragEnd");
    }
  };
  // 鼠标按下桌拽结束=====
  const blockMousedown = (e, block, index) => {
    // 预览时不允许操作
    if (preview.value) return;
    e.preventDefault();
    e.stopPropagation();
    // 给block添加一个属性：focus，点击获取焦点后，facus为true
    // 按住shift时可以状态切换，多选
    if (e.shiftKey) {
      // 当前只选中一个节点时不切换选中状态
      if (focusData.value.focused.length <= 1) {
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        // 清空其他选中样式
        clearBlocksFocus();
        // 一旦被选中，则添加一个选中的样式
        block.focus = true;
      }
    }
    // 记录选中组件的下标
    selectIndex.value = index;
    callback(e);
  };
  const canvasMousedown = () => {
    // 预览时不允许操作
    if (preview.value) return;
    // 清空选中下标
    selectIndex.value = -1;
    // 点击画布时取消元素选中状态
    clearBlocksFocus();
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
  };

  // 元素编辑菜单
  const onContextMenuBlock = (e, block) => {
    e.preventDefault();
    $Dropdown({
      el: e.target,
      block,
    });
  };

  return {
    blockMousedown,
    canvasMousedown,
    focusData,
    mousdown,
    lastSelectBlock,
    markLine,
    clearBlocksFocus,
    onContextMenuBlock,
  };
}
