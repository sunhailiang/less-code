import { computed, ref } from "vue";

export default (dragState, markLine, moveX, moveY, data, focusData) => {
  // 参考线开始=====
  let selectIndex = ref(-1); // 默认没有选中的
  // 选中的最后一个组件
  let lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);
  const lines = () => {
    // 最后拖拽的元素微博是
    const { width: Bwidth, height: Bheight } = lastSelectBlock.value;
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
      const { top: Atop, left: Aleft, width: Awidth, height: Aheight } = block;
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
  };
  // 参考线开始======
  // 计算当前元素的最新的left，去线里面匹配，找到了，就显示出
  let left = moveX - dragState.startX + dragState.startLeft;
  let top = moveY - dragState.startY + dragState.startTop;
  // y轴：计算横线显示的时机，小于等于5像素时，出现参考线
  let y = null;
  for (let i = 0; i < dragState.lines.y.length; i++) {
    const { top: t, showTop: s } = dragState.lines.y[i];
    // 距离元素小于5的时候说明接近元素了
    console.log("top", dragState.lines.y[i], t, top);
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

  return {
    dragState,
    moveX,
    moveY,
    lines,
    selectIndex,
    lastSelectBlock,
  };
};
