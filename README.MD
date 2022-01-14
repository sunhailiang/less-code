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
