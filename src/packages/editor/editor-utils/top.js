import { events } from "./events";
import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import editor from "./editor";

export default (props) => {
  // 画布上选中元素
  const { focusData } = editor(props);
  const state = {
    current: -1, // 指针
    queue: [], //存放操作命令
    commands: {}, // 命令和对应功能映射表
    commandArray: [], // 存放命令
    destroyArray: [], // 销毁列表
  };
  // 命令注册
  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      const { back, forward } = command.execute(...args);
      back();
      // 如果是页面操作行为，需要记录到队列中则改变指针，添加方法
      if (!command.pushQueue) {
        return;
      }
      let { queue, current } = state;
      // 如果当前存在撤销操作，根据当前最新的current进行截取即可
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }
      queue.push({ back, forward });
      state.current = current + 1;
    };
  };
  // 重做/前一步
  registry({
    name: "forward",
    keyboard: "ctrl+r",
    execute() {
      return {
        back() {
          let item = state.queue[state.current + 1];
          if (item) {
            item.back && item.back();
            state.current++;
          }
        },
      };
    },
  });
  // 撤销/上一步
  registry({
    name: "back",
    keyboard: "ctrl+z",
    execute() {
      return {
        back() {
          // 队列清空，没有可以撤销的
          if (state.current === -1) {
            return;
          }
          // 队列不为空，就可以撤销
          let item = state.queue[state.current];
          if (item) {
            item.forward && item.forward();
            state.current--;
          }
        },
      };
    },
  });
  // 注册拖拽监控
  registry({
    name: "dragStart",
    pushQueue: true,
    init() {
      // 记录拖拽之前的状态
      this.before = null;

      //初始化之后开始执行
      // 监控拖拽之前的状态
      const dragStart = () => (this.before = deepcopy(props.value.blocks));
      // 监控拖拽之后的状态
      const dragEnd = () => state.commands.dragStart();

      events.on("dragStart", dragStart);
      events.on("dragEnd", dragEnd);
      return () => {
        events.off("dragStart", dragStart);
        events.off("dragEnd", dragEnd);
      };
    },
    execute() {
      // 拿到操作之前的数据
      let before = this.before;
      // 拿到操作之后的数据
      let after = props.value.blocks;

      return {
        back() {
          props.value = { ...props.value, blocks: after };
        },
        forward() {
          props.value = { ...props.value, blocks: before };
        },
      };
    },
  });
  // 为导入json注册事件，更新画布，存放在事件队列中，方便回退和重做
  registry({
    name: "updateContainer",
    pushQueue: true,
    execute(newValue) {
      console.log("没变？", newValue);
      // 新的就是传进来的json模版
      // 旧的就是原来的布局样式
      let state = {
        before: props.value,
        after: newValue,
      };
      return {
        back: () => {
          // 回退
          props.value.container = state.after.container;
          console.log("props", props.value.container, state.after.container);
        },
        forward: () => {
          // 重做
          props.value = state.before;
        },
      };
    },
  });
  // 导入组件，更新节点
  registry({
    name: "updateBlock",
    pushQueue: true,
    execute(newblock, oldblock) {
      let state = {
        before: props.value.block,
        after: (() => {
          let blocks = [...props.value.blocks];
          // 替换选中节点
          const idx = props.value.blocks.indexOf(oldblock);
          if (idx > -1) {
            blocks.splice(idx, 1, newblock);
          }
          return blocks;
        })(),
      };
      return {
        back: () => {
          props.value = { ...props.value, blocks: state.after };
        },
        forward: () => {
          props.value = { ...props.value, blocks: state.before };
        },
      };
    },
  });
  // 注册置顶操作
  registry({
    name: "toMaxIndex",
    pushQueue: true,
    execute() {
      let before = deepcopy(props.value.blocks);
      let after = (() => {
        let { focused, unfocused } = focusData.value;
        // 找出最大值
        let maxZIndex = unfocused.reduce((prev, block) => {
          return Math.max(prev, block.zIndex);
        }, -Infinity);
        // 把已选中的zindex比最大的+1
        focused.forEach((block) => (block.zIndex = maxZIndex + 1));
        return props.value.blocks;
      })();
      return {
        back: () => {
          props.value = { ...props.value, blocks: after };
        },
        forward: () => {
          props.value = { ...props.value, blocks: before };
        },
      };
    },
  });
  // 注册置底操作
  registry({
    name: "toLowIndex",
    pushQueue: true,
    execute() {
      let before = deepcopy(props.value.blocks);
      let after = (() => {
        let { focused, unfocused } = focusData.value;
        // 找出最小值
        let minZIndex =
          unfocused.reduce((prev, block) => {
            return Math.min(prev, block.zIndex);
          }, Infinity) - 1;
        // 不能出现负值,如果有小于0的，那么所有元素的index增加一个，唯独我当前选中这个index改成0
        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex);
          minZIndex = 0;
          unfocused.forEach((block) => (block.zIndex += dur));
        }
        focused.forEach((block) => (block.zIndex = minZIndex));
        return props.value.blocks;
      })();
      return {
        back: () => {
          props.value = { ...props.value, blocks: after };
        },
        forward: () => {
          props.value = { ...props.value, blocks: before };
        },
      };
    },
  });
  // 注册删除按钮
  registry({
    name: "delete",
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(props.value.blocks),
        after: focusData.value.unfocused, // 选中都干掉了，剩下的只有未选中
      };
      return {
        back: () => {
          props.value = { ...props.value, blocks: state.after };
        },
        forward: () => {
          props.value = { ...props.value, blocks: state.before };
        },
      };
    },
  });
  // 注册键盘快捷键
  const keyboardEvent = (() => {
    const keyCodes = {
      82: "r", // 重做
      90: "z", // 撤销
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e;
      let keyString = [];
      if (ctrlKey) keyString.push("ctrl");
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };

    // 初始化
    const init = () => {
      window.addEventListener("keydown", onKeydown);
      return () => {
        // 销毁事件
      };
    };
    return init;
  })();
  // 初始化监控
  (() => {
    state.destroyArray.push(keyboardEvent());
    state.commandArray.forEach(
      (command) => command.init && state.destroyArray.push(command.init())
    );
  })();
  // 组件销毁时解绑
  onUnmounted(() => {
    state.destroyArray.forEach((fn) => fn && fn());
  });

  return state;
};
