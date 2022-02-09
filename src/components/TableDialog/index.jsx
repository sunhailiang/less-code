import { defineComponent, createVNode, render, reactive } from "vue";
import deepcopy from "deepcopy";
import {
  ElDialog,
  ElButton,
  ElTable,
  ElTableColumn,
  ElInput,
} from "element-plus";
let vm;
const tableComponent = defineComponent({
  props: {
    option: {
      type: Object,
    },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: [], // 数据
    });
    let methods = {
      show(option) {
        state.option = option; // 配置选项
        state.isShow = true; // 控制展示
        state.editData = deepcopy(option.data); // 默认展示数据
      },
    };
    ctx.expose(methods);
    // 添加一个select选项
    const addSelectItem = () => {
      state.editData.push({});
    };
    // 取消
    const onConcel = () => {
      state.isShow = false;
    };
    // 确认
    const onConfirm = () => {
      state.option.onConfirm(state.editData);
      onConcel();
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.config.label}>
          {{
            default: () => (
              <div>
                <div>
                  <ElButton type="primary" onClick={addSelectItem}>
                    添加
                  </ElButton>
                  <ElButton>重置</ElButton>
                </div>
                <ElTable data={state.editData}>
                  <ElTableColumn type="index"></ElTableColumn>
                  {state.option.config.table.options.map((item) => {
                    return (
                      <ElTableColumn label={item.label}>
                        {{
                          default: ({ row }) => (
                            <ElInput v-model={row[item.field]} />
                          ),
                        }}
                      </ElTableColumn>
                    );
                  })}
                  <ElTableColumn label="操作">
                    <ElButton type="danger">删除</ElButton>
                  </ElTableColumn>
                </ElTable>
              </div>
            ),
            footer: () => (
              <>
                <ElButton onClick={onConfirm} type="primary">
                  确认
                </ElButton>
                <ElButton onClick={onConcel}>取消</ElButton>
              </>
            ),
          }}
        </ElDialog>
      );
    };
  },
});

export const $tableDialog = (option) => {
  if (!vm) {
    const el = document.createElement("div");
    vm = createVNode(tableComponent, { option });
    render(vm, el);
    document.body.appendChild(el);
  }
  let { show } = vm.component.exposed;
  show(option);
};
