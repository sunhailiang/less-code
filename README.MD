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

> 五、通过 key 匹配组件

- 物料区添加物料（组件列表-这里用 element-plus）
  - 安装 element-plus
- 通过数据的 key 来匹配物料区的组件，在画布渲染

## 拖拽组件生成页面
