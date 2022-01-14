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
