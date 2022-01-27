// 物料组件map

//匹配右侧属性菜单-工厂函数
const createInputProp = (label) => ({ type: "input", label });
const createColor = (label) => ({ type: "color", label });
const createSelectProp = (label, option) => ({ type: "select", label, option });
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
    // 此处的props是在拖拽时，传进来的该组件自带的可配置的参数
    render: ({ props }) => (
      <span style={{ color: props.color, fontSize: props.size }}>
        {props.text || "渲染文本"}
      </span>
    ),
    key: "text",
    props: {
      text: createInputProp("文本内容"),
      color: createColor("字体颜色"),
      size: createSelectProp("字体大小", [
        { label: "12px", value: "12px" },
        { label: "14px", value: "14px" },
        { label: "15px", value: "15px" },
        { label: "16px", value: "16px" },
        { label: "18px", value: "18px" },
        { label: "20px", value: "20px" },
      ]),
    },
  },
  {
    label: "按钮",
    preview: () => <ElButton type="success">预览按钮</ElButton>,
    // 此处的props是在拖拽时，传进来的该组件自带的可配置的参数
    render: ({ props }) => (
      <ElButton type={props.type} size={props.size}>
        {props.text || "按钮"}
      </ElButton>
    ),
    key: "button",
    props: {
      text: createInputProp("按钮文本"),
      color: createColor("字体颜色"),
      type: createSelectProp("按钮类型", [
        { label: "基础", value: "primary" },
        { label: "成功", value: "success" },
        { label: "警告", value: "warning" },
        { label: "失败", value: "danger" },
        { label: "文本", value: "text" },
      ]),
      size: createSelectProp("按钮尺寸", [
        { label: "大", value: "large" },
        { label: "默认", value: "default" },
        { label: "小", value: "small" },
      ]),
    },
  },
  {
    label: "输入框",
    preview: () => <ElInput placeholder="预览输入框" />,
    render: () => <ElInput placeholder="请输入" />,
    key: "input",
    props: {
      text: createInputProp("文本内容"),
    },
    model: {
      // 此处一个是key一个是label，混合一起写
      default: "绑定字段",
    },
  },
]);
// 导出配置
export default registerConfig;
