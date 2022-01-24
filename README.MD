## 可视化低代码平台

## 生产方式

> 自由拖拽布局式一键生成，导出页面

## 第一步：搭建工作台，解析组件数据

> 长这样

- 最终结果.jpg

## 技术点说明

### setup 是 Vue3 特性函数, 特性:

1.  setup 函数是处于 生命周期函数 beforeCreate 和 Created 两个钩子函数之间的函数
2.  setup 函数是 Composition API（组合 API）的入口
3.  在 setup 函数中定义的变量和方法最后都是需要 return 出去的 不然无法再模板中使用
4.  setup 函数只能是同步的不能是异步的
5.  setup 函数中的 this 修改成了 undefined

### defineComponent

1. 只是对 setup 函数进行封装，返回 options 的对象
2. 最重要:在 TS 下，给予了组件 正确的参数类型推断
3. 组件的 setup 方法准确的参数类型定义
4. 可以接受显式的自定义 props 接口或从属性验证对象中自动推断
5. 正确适配无 props、数组 props 等形式
6. 正确推断 setup() 组件的参数类型

### ref

1. 用于创建一个响应式数据，当数据发生改变时，Vue 会自动更新 UI
2. 仅能监听基本类型的变化，不能监听复杂类型的变化（比如对象、数组）
3. 监听复杂类型的变化可以使用 reactive 函数

## 步骤拆分

> 一、页面布局

- 新建 src/packages 文件夹，用来存放各种组件解析包
- 续建 packages/editor 文件夹，存放工作台布局，画布

```js
import { defineComponent, computed } from "vue";
import "./index.less";
import Block from "../block";
export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
  },
  setup() {
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
             画布
            </div>
          </div>
        </div>
      </div>
    );
  },
});
```

> 二、构建组件数据（根据数据可以解析出组件）

- 新建 src/data，json 数据存放画布和画布上组建的数据(先写死跑通，后面这些数据全部是生成数据)

```js
// 数据中key很重要，用来匹配实际组件
{
  "container": {
    "width": "550",
    "height": "550"
  },
  "blocks": [
    {
      "top": 100,
      "left": 100,
      "zIndex": 1,
      "key": "text"
    },
    {
      "top": 200,
      "left": 200,
      "zIndex": 1,
      "key": "button"
    },
    {
      "top": 300,
      "left": 300,
      "zIndex": 1,
      "key": "input"
    }
  ]
}

```

> 三、构建画布，把画布数据从组件数据中分解出来

- src/packages/editor

```js
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
```

- 在 app.vue 中使用 Editor 并把数据传给 Editor

```html
<template>
  <div class="lcdp"><Editor v-model="state" /></div>
</template>

<script>
  import { ref } from "vue";
  import coreData from "./data";
  // 引入editor
  import Editor from "./packages/editor/index.jsx";
  export default {
    components: {
      Editor,
    },
    setup() {
      // ref：建立响应式关系，监听数据变化
      const state = ref(coreData);
      return {
        state,
      };
    },
  };
</script>

<style lang="less">
  .lcdp {
    position: fixed;
    top: 20px;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }
</style>
```

> 四、构建组件，把画布上的组件从组件数据中分析出来

- 新建 src/packages/block，用来解析画布上的组件，所以要把组件数据解析出来传给 block

```js
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
        代码块
      </div>
    );
  },
});
```

> 五、添加物料，通过 key 匹配组件放到画布

- 物料区添加物料（组件列表-这里用 element-plus）
  - 安装 element-plus，并全局按需注入
- 新建 components/Meterial

```js
import { ElButton, ElInput } from "element-plus";
import "element-plus/dist/index.css";
let els = [ElButton, ElInput];
export default {
  useElementPlus: (app) => {
    els.forEach((item) => {
      // 全局注入
      app.component(item.name, item);
    });
  },
};
```

- main.js

```js
import useComponent from "./components";
app.use(store).use(router).use(useComponent(app)).mount("#app");
```

- 新建 src/utils/editor-config,添加物料，做 key 映射

```js
// 添加物料列表
// 一、引入注册好的物料组件

// 物料区注册列表
// 画布区map映射

let createEditorConfig = () => {
  // 物料列表-物料区列表
  let componentList = [];
  // 组件map列表-匹配到画布中
  let componentMap = {};

  return {
    // 注册组件
    register: (components) => {
      // 物料列表
      componentList.push(...components);
      // 画布组件列表
      components.map((item) => {
        componentMap[item.key] = item;
      });
    },
    componentList,
    componentMap,
  };
};
let registerConfig = createEditorConfig();
// 注册组件
// preview:左侧物料
// render最终渲染到画布上
registerConfig.register([
  {
    label: "文本",
    preview: () => "文本预览",
    render: () => "渲染文本",
    key: "text",
  },
  {
    label: "按钮",
    preview: () => <ElButton type="success">预览按钮</ElButton>,
    render: () => <ElButton type="success">渲染按钮</ElButton>,
    key: "button",
  },
  {
    label: "输入框",
    preview: () => <ElInput placeholder="预览输入框" />,
    render: () => <ElInput placeholder="渲染输入框" />,
    key: "input",
  },
]);
// 导出配置
export default registerConfig;
```

- App.vue 中注册配置

```js
import EditorConfig from "./utils/editor-config";
// 注入组件配置,在用到的地方随时可取
provide("config", EditorConfig);
```

- 通过数据的 key 来匹配物料区的组件，在画布渲染
  - packages/block

```js
import { defineComponent, computed, inject } from "vue";
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
    // 获取组件配置
    let config = inject("config");
    return () => {
      // 通过key匹配出组件渲染到画布上
      const component = config.componentMap[props.block.key];
      // 通过rander渲染
      const renderComponent = component.render();
      return (
        <div class="block" style={blockStyle.value}>
          {renderComponent}
        </div>
      );
    };
  },
});
```

- 渲染物料区
  - packages/editor/left

```js
import { defineComponent, inject } from "vue";
export default defineComponent({
  setup() {
    // 获取配置数据
    let config = inject("config");
    return () => {
      return config.componentList.map((item) => (
        <div className="left-item">
          <span>{item.label}</span>
          <div>{item.preview()}</div>
        </div>
      ));
    };
  },
});
```

## 拖拽组件生成页面-拖拽左侧物料区物料往画布上放

- 前置知识点
- H5 的拖拽技术

  - 属性
    - draggable
  - 事件
    - ondragstart 开始拖动
    - ondrag 拖动中
    - ondragend 拖动释放
    - ondragenter 进入容器范围
    - ondragover 容器范围内移动
    - ondragleave 离开容器
    - ondrop 释放

> 物料元素注册 ondragstart，一拖动找到目标容器，进入容器范围内，释放时，将目标组件匹配到容器画布上(注意鼠标光标样式的变化)

- dragenter 进入容器，添加元素可移动光标
- gragover 经过目标是阻止默认行为，否则无法 drop
- dragleave 离开容器范围则为禁用光标
- drag 释放时根据拖拽的组件给画布上添加一个组件
  > 以上步骤指的是我在物料区的操作

```js
import { defineComponent, inject, onUnmounted } from "vue";
import bus from "@/utils/eventBus";
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
    // 当前拖拽的目标元素
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
            alignCenter: true,
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
      // 拖拽时知道拖拽的哪个组件
      currentComponent = component;
      const target = props.container.value;

      //dragenter 进入容器，添加元素可移动光标
      target.addEventListener("dragenter", dragenter);
      //dragover 经过目标是阻止默认行为，否则无法 drop
      target.addEventListener("dragover", dragover);
      //dragleave 离开容器范围则为禁用光标
      target.addEventListener("dragleave", dragleave);
      //drop 释放时根据拖拽的组件给画布上添加一个组件
      target.addEventListener("drop", drop);
    };
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
        >
          <span>{component.label}</span>
          <div>{component.preview()}</div>
        </div>
      ));
    };
  },
});
```

- packages/editor/

```js
// 监听左侧物料拖拽释放后最新的组件数据
bus.on("getCoreData", (res) => {
  // 最终把新的数据给核心
  data.value = res;
});
```

> 让拖拽的松手时位于鼠标光标正中间

- packages/block

```js
import { defineComponent, computed, inject, onMounted, ref } from "vue";
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
    // 获取组件配置配置
    let config = inject("config");
    const blockRef = ref(null);
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        // 只有在拖动时元素居中-计算居中位置
        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = props.block.left - offsetWidth / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = props.block.top - offsetHeight / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.alignCenter = false;
      }
    });
    return () => {
      const component = config.componentMap[props.block.key];
      const renderComponent = component.render();
      return (
        <div class="block" style={blockStyle.value} ref={blockRef}>
          {renderComponent}
        </div>
      );
    };
  },
});
```

> 自由拖拽画布上的组件

- 选中一个组件/选中多个组件/点击画布空白区域取消选中状态
  - packages/editor/
  - 给 block 组件添加点击事件 blockMousedown

```js
<div
  class="canvas"
  style={canvasStyle.value}
  ref={containerRef}
  onMousedown={canvasMousedown}
>
  {data.value.blocks.map((block) => (
    // 渲染子组件
    <Block
      block={block}
      onMousedown={(e) => blockMousedown(e, block)}
      // 选中加个样式
      class={block.focus ? "editor-block-focus" : ""}
    />
  ))}
</div>
```

- /packages/editor/editor-utils/editor

```js
// 清空其他选中样式
const clearBlocksFocus = () => {
  data.value.blocks.forEach((block) => (block.focus = false));
};
const blockMousedown = (e, block) => {
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
  callback(e);
};
```

- 确定选中和未选中的数据

  - /packages/editor/editor-utils/editor

```js
// 确认哪些选中，那些没选中
const focusData = computed(() => {
  let focused = [];
  let unfocused = [];
  data.value.blocks.forEach((block) =>
    (block.focus ? focused : unfocused).push(block)
  );
  return { focused, unfocused };
});
```

- packages/editor/

```js
// 画布上选中元素
const { blockMousedown, canvasMousedown, focusData } = events(data, () => {
  console.log("获取选中的元素", focusData.value.focused);
});
```

- 拖拽选中元素
  - packages/editor/

```js
// 画布上选中元素
const { blockMousedown, canvasMousedown, focusData, mousdown } = events(
  data,
  (e) => {
    console.log("获取选中的元素", focusData.value.focused);
    //选中后开始拖拽
    mousdown(e);
  }
);
```

- packages/editor/editor-utils/editor

```js
// 鼠标按下拖拽开始=====
// 拖拽时状态信息
let dragState = {
  startX: 0,
  startY: 0,
};
// 鼠标按下
const mousdown = (e) => {
  //鼠标按下tongues坐标信息
  dragState = {
    startX: e.clientX,
    startY: e.clientY,
    startPositon: focusData.value.focused.map(({ top, left }) => ({
      top,
      left,
    })),
  };
  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseup);
};
// 按下移动
const mousemove = (e) => {
  // 计算选中元素的移动距离
  let durX = e.clientX - dragState.startX;
  let durY = e.clientY - dragState.startY;
  focusData.value.focused.forEach((block, idx) => {
    block.top = dragState.startPositon[idx].top + durY;
    block.left = dragState.startPositon[idx].left + durX;
  });
};
// 鼠标抬起
const mouseup = () => {
  document.removeEventListener("mousemove", mousemove);
  document.removeEventListener("mouseup", mouseup);
};
// 鼠标按下桌拽结束=====
```

## 构建辅助线功能

> 确认参考者（最后选中的那个元素）

1. 靠近某参考元素时获取参考元素的上中下，左中右，三个位置的位置，还有宽高

- package/editor/editor-utils/editor

```js
const mousdown = (e) => {
  // 最后拖拽的元素微博是
  const { width: Bwidth, height: Bheight } = lastSelectBlock.value;

  //鼠标按下同步坐标信息
  dragState = {
    startX: e.clientX,
    startY: e.clientY,
    startLeft: lastSelectBlock.value.left, // 拖拽前的位置
    startTop: lastSelectBlock.value.top,
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
```

2. 拖动时，实时获取拖动元素的位置，去对比参考元素的具体位置
3. 当拖动元素的位置接近参考元素的位置时，出现参考线，并出现小距离吸附效果

- package/editor/editor-utils/editor

```js
// 按下移动
const mousemove = (e) => {
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
  // 参考线结束=====
  // 计算选中元素的移动距离
  let durX = moveX - dragState.startX;
  let durY = moveY - dragState.startY;
  focusData.value.focused.forEach((block, idx) => {
    block.top = dragState.startPositon[idx].top + durY;
    block.left = dragState.startPositon[idx].left + durX;
  });
};
```

> 画参考线

- packages/editor

```js
// 画布上选中元素
const {
  blockMousedown,
  canvasMousedown,
  focusData,
  markLine,
  mousdown,
  lastSelectBlock,
} = events(data, (e) => {
  console.log("获取选中的元素", focusData.value.focused);
  console.log("最后返回谁？", lastSelectBlock);
  console.log("参考线", markLine);
  //选中后开始拖拽
  mousdown(e);
});

{
  /* 画布内容 */
}
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
    />
  ))}
  {
    /* x辅助线 */
    markLine.x !== null && (
      <div class="line-x" style={{ left: markLine.x + "px" }}></div>
    )
  }
  {
    /* x辅助线 */
    markLine.y !== null && (
      <div class="line-y" style={{ top: markLine.y + "px" }}></div>
    )
  }
</div>;
```

## 实现顶部撤销和重做按钮工功能

- 说白了所谓的撤销/重做，指的是维护一个“行为队列”，前进后退利用指针，去索引队列中的操作命令
- 同步操作信息（组件拖拽，布局拖拽），采用订阅发布
- 使用第三方订阅发布库:

> packages/editor/editor-utils/top

```js
import { events } from "./events";
import deepcopy from "deepcopy";
import { onUnmounted } from "vue";

export default (props) => {
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
    state.commands[command.name] = () => {
      const { back, forward } = command.execute();
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
      console.log("操作队列", queue);
    };
  };

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
```

> 物料区组件拖拽

- 既然监听物料拖拽，那就就去对应的拖拽事件
  - packages/editor/editor-utils/left

```js
const dragStart = (e, component) => {
  // 发布开始拖拽
  events.emit("dragStart");
};

// 拖拽结束后释放监听事件
const dragEnd = () => {
  // 发布拖拽结束
  events.emit("dragEnd");
};
```

> 画布行为的撤销重做/快捷键

- 画布上拖拽那就监听移动事件
  - packages/editor/editor-utils/editor

```js
const mousemove = (e) => {
  // 发布拖拽状态-同步撤销和重做的状态
  if (!dragState.dragging) {
    dragState.dragging = true;
    events.emit("dragStart");
  }
};

// 鼠标抬起
const mouseup = () => {
  // 发布拖拽状态-同步撤销和重做的状态
  if (dragState.dragging) {
    events.emit("dragEnd");
  }
};
```

## 布局结果导入/导出（JSON）

- 按钮位置
  - packages/editor/top

```js
const buttons = [
  {
    label: "导出",
    icon: "iconfont icon-daochu",
    handler: () => {
      $Dialog({
        title: "导出JSON",
        // 将编辑好的Json数据传到dialog组件以便复制使用
        content: JSON.stringify(props.coreData.value),
        footer: true,
      });
    },
  },
  {
    label: "导入",
    icon: "iconfont icon-daoru",
    handler: () =>
      $Dialog({
        title: "导入JSON",
        content: "fuckyou",
        footer: true,
        onConfirm: (data) => {
          commands.importUpdateContainer(JSON.parse(data));
        },
      }),
  },
];
```

- 导出
  - 即将布局好的 json 导出去解析成页面
  - packages/editor/top

```js
const buttons = [
  {
    label: "导出",
    icon: "iconfont icon-daochu",
    handler: () => {
      $Dialog({
        title: "导出JSON",
        // 将编辑好的Json数据传到dialog组件以便复制使用
        content: JSON.stringify(props.coreData.value),
        footer: true,
      });
    },
  },
];
```

- 导入
  - 将已经写好的 json 解析到画布
  - packages/editor/top

```js
const buttons = [
  {
    label: "导入",
    icon: "iconfont icon-daoru",
    handler: () =>
      $Dialog({
        title: "导入JSON",
        content: "fuckyou",
        footer: true,
        onConfirm: (data) => {
          commands.importUpdateContainer(JSON.parse(data));
        },
      }),
  },
];
```

- packages/editor/top

```js
// 为导入json注册注册事件，存放在事件队列中，方便回退和重做
registry({
  name: "importUpdateContainer",
  pushQueue: true,
  execute(newValue) {
    // 新的就是传进来的json模版
    // 旧的就是原来的布局样式
    let state = {
      before: props.value,
      after: newValue,
    };
    return {
      back: () => {
        // 回退
        props.value = state.after;
      },
      forward: () => {
        // 重做
        props.value = state.before;
      },
    };
  },
});
```

- 导入撤销
  - packages/editor/editor-utils/top

## 元素层级（置底/置顶），元素删除，预览

- packages/editor/top

```js
const buttons = [
  {
    label: "置顶",
    icon: "iconfont icon-dingceng",
    handler: () => commands.toMaxIndex(),
  },
  {
    label: "置底",
    icon: "iconfont icon-diceng",
    handler: () => commands.toLowIndex(),
  },
  {
    label: "删除",
    icon: "iconfont icon-shanchu",
    handler: () => commands.delete(),
  },
  {
    label: () => (props.preview.value ? "编辑" : "预览"),
    icon: () =>
      props.preview.value ? "iconfont icon-bianji" : "iconfont icon-yulan",
    handler: () => {
      //通过判断preview判断，是否是预览，如果是预览，进行一系列的代码隔离
      // eslint-disable-next-line vue/no-mutating-props
      props.preview.value = !props.preview.value;
      props.clearBlocksFocus();
    },
  },
];
```

- packages/editor/editor-utils/editor

```js
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
```

## 完成编辑/继续编辑

- 说白了就是一个状态判断，通过一个变量判读只展示 json 数据，还是展示整个工作台
- 变量 package/editor/

```js
//完成编辑,直接退出画布状态，完成当前页面编辑
const editorComplete = ref(false);
```

- 添加一个顶部菜单按钮 packages/editor/top

```js
const buttons = [
  {
    label: "完成编辑",
    icon: "iconfont icon-wancheng",

    handler: () => {
      // eslint-disable-next-line vue/no-mutating-props
      props.editorComplete.value = true;
      props.clearBlocksFocus();
    },
  },
];
```

- 根据 editorComplete 进行切换

```js
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
        <div class="editor">编辑器</div>
```

## 元素编辑菜单（鼠标右击）

- 注册菜单事件
- 写菜单组件
- 菜单事件绑定
