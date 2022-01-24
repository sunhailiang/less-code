import bus from "@/utils/eventBus"; // eventbus
import { events } from "./events"; // mitt发布订阅
export default (props) => {
  let currentComponent = null;
  const dragenter = (e) => {
    e.dataTransfer.dropEffect = "move";
  };
  const dragover = (e) => {
    e.preventDefault();
  };
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };
  const drop = (e) => {
    // 释放时匹配当前拖拽的组件
    let blocks = props.coreData.value.blocks;

    let coreData = {
      ...props.coreData.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true, // 初次拖拽到画布时希望居中
        },
      ],
    };
    bus.emit("getCoreData", coreData);
    // 匹配完成后，释放元素
    currentComponent = null;
  };
  // 获取容器dom
  // 物料拖拽事件
  const dragStart = (e, component) => {
    // 获取目标容器
    const target = props.container.value;

    // 拖拽时知道拖拽的哪个组件
    currentComponent = component;

    //dragenter 进入容器，添加元素可移动光标
    target.addEventListener("dragenter", dragenter);
    //dragover 经过目标是阻止默认行为，否则无法 drop
    target.addEventListener("dragover", dragover);

    //dragleave 离开容器范围则为禁用光标
    target.addEventListener("dragleave", dragleave);

    //drop 释放时根据拖拽的组件给画布上添加一个组件
    target.addEventListener("drop", drop);
    // 发布开始拖拽
    events.emit("dragStart");
  };
  // 拖拽结束后释放监听事件
  const dragEnd = () => {
    console.log("拖拽结束");
    // 获取目标容器
    const target = props.container.value;
    target.removeEventListener("dragenter", dragenter);
    target.removeEventListener("dragover", dragover);
    target.removeEventListener("dragleave", dragleave);
    target.removeEventListener("drop", drop);
    // 发布拖拽结束
    events.emit("dragEnd");
  };

  return { drop, dragStart, dragEnd };
};
