export default function editorEvent(data) {
  // 清空其他选中样式
  const clearBlocksFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };
  const blockMousedown = (e, block) => {
    e.preventDefault();
    e.stopPropagation();
    // 给block添加一个属性：focus，点击获取焦点后，facus为true
    if (!block.focus) {
      // 清空其他选中样式
      clearBlocksFocus();
      // 一旦被选中，则添加一个选中的样式
      block.focus = true;
    } else {
      block.focus = false;
    }
  };
  return {
    blockMousedown,
  };
}
