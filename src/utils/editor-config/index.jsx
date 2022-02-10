// 物料组件map
// 使用自定义物料
import Range from "../../components/Range";

//匹配右侧属性菜单-工厂函数
const createInputProp = (label) => ({ type: "input", label });
const createColor = (label) => ({ type: "color", label });
const createSelectProp = (label, option) => ({ type: "select", label, option });
const createTableProp = (label, table) => ({ type: "table", label, table });
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
    render: ({ props, size }) => (
      <span
        style={{
          color: props.color,
          display: "inline-block",
          fontSize: props.size,
          width: size.width + "px",
          height: size.height + "px",
        }}
      >
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
    resize: {
      width: true,
      height: true,
    },
  },
  {
    label: "按钮",
    preview: () => <ElButton type="success">预览按钮</ElButton>,
    // 此处的props是在拖拽时，传进来的该组件自带的可配置的参数
    render: ({ props, size }) => (
      <ElButton
        type={props.type}
        size={props.size}
        style={{ width: size.width + "px", height: size.height + "px" }}
      >
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
    resize: {
      width: true,
      height: true,
    },
  },
  {
    label: "输入框",
    preview: () => <ElInput placeholder="预览输入框" />,
    render: ({ model, size }) => {
      return (
        <ElInput
          placeholder="请输入"
          {...model.default}
          style={{ width: size.width + "px" }}
        />
      );
    },
    key: "input",
    props: {
      text: createInputProp("文本内容"),
    },
    model: {
      default: "绑定字段",
    },
    resize: {
      width: true,
    },
  },
  {
    label: "范围选择器",
    preview: () => <Range />,
    render: ({ model }) => {
      console.log("range", model);
      return (
        <Range
          {...{
            start: model.start.modelValue,
            end: model.end.modelValue,
            "onUpdate:start": model.start["onUpdate:modelValue"],
            "onUpdate:end": model.end["onUpdate:modelValue"],
          }}
        />
      );
    },
    model: {
      start: "开始范围",
      end: "结束范围",
    },
    key: "range",
  },
  {
    label: "下拉框",
    preview: () => <ElSelect modelValue=""></ElSelect>,
    render: ({ props, model }) => {
      return (
        <ElSelect {...model.default}>
          {(props.options || []).map((item, index) => {
            return (
              <ElOption
                label={item.label}
                value={item.value}
                key={index}
              ></ElOption>
            );
          })}
        </ElSelect>
      );
    },
    key: "select",
    props: {
      options: createTableProp("下拉选项", {
        options: [
          {
            label: "显示值",
            field: "label",
          },
          {
            label: "绑定值",
            field: "value",
          },
        ],
        key: "label",
      }),
    },
    model: {
      default: "绑定字段",
    },
  },
]);
// 导出配置
export default registerConfig;
