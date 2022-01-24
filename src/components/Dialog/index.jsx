import { defineComponent, createVNode, render, reactive } from "vue";
import { ElDialog, ElInput, ElButton } from "element-plus";

const DialogComponent = defineComponent({
  props: {
    option: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    // 暴露方法
    ctx.expose({
      // 展示
      showDialog(option) {
        state.option = option;
        state.isShow = true;
      },
    });
    //确认
    const onConfirm = () => {
      // 确认导入
      state.option.onConfirm && state.option.onConfirm(state.option.content);
      state.isShow = false;
    };
    // 取消
    const onCancel = () => {
      state.isShow = false;
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}
              ></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div class="footer">
                  <ElButton onClick={onCancel}>取消</ElButton>
                  <ElButton onClick={onConfirm} type="primary">
                    确定
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export function $Dialog(option) {
  if (!vm) {
    // 手动挂载组件
    let el = document.createElement("div");
    // 创建虚拟节点
    vm = createVNode(DialogComponent, { option });
    // 渲染成时机节点
    document.body.appendChild((render(vm, el), el));
  }

  // 获取组件暴露的方法
  let { showDialog } = vm.component.exposed;
  // 调用展示的方法
  showDialog(option);
}
