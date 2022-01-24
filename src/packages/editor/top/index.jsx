import { defineComponent } from "vue";
import "./index.less";
import useTop from "../editor-utils/top";
import { $Dialog } from "@/components";
export default defineComponent({
  props: {
    coreData: {
      type: Object,
    },
    focusData: {
      type: Object,
    },
    preview: {
      type: Object,
    },
    clearBlocksFocus: {
      type: Function,
    },
    editorComplete: {
      type: Object,
    },
  },
  setup(props) {
    let { commands } = useTop(props.coreData, props.focusData);

    const buttons = [
      {
        label: "撤销",
        icon: "iconfont icon-chexiao1",
        handler: () => commands.back(),
      },
      {
        label: "重做",
        icon: "iconfont icon-zhongzuo1",
        handler: () => commands.forward(),
      },
      {
        label: "导出",
        icon: "iconfont icon-daochu",
        handler: () => {
          $Dialog({
            title: "导出JSON",
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
          // eslint-disable-next-line vue/no-mutating-props
          props.preview.value = !props.preview.value;
          props.clearBlocksFocus();
        },
      },
    ];
    return () => {
      return (
        <div class="top-container">
          {buttons.map((btn) => {
            let icon = typeof btn.icon === "function" ? btn.icon() : btn.icon;
            let label =
              typeof btn.label === "function" ? btn.label() : btn.label;
            return (
              <div class="btn" onClick={btn.handler}>
                <i class={icon} class="icon"></i>
                <div class="label">{label}</div>
              </div>
            );
          })}
        </div>
      );
    };
  },
});
