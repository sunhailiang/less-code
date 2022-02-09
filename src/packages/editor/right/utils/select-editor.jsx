import { defineComponent, computed } from "vue";
import deepcopy from "deepcopy";
import { ElButton, ElTag } from "element-plus";
import { $tableDialog } from "../../../../components";
export default defineComponent({
  props: {
    propConfig: {
      type: Object,
    },
    modelValue: {
      type: Array,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue || [];
      },
      set(newValue) {
        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });
    const editSelect = () => {
      // 打开对话框编辑下拉框选项
      $tableDialog({
        config: props.propConfig,
        data: data.value,
        onConfirm(value) {
          data.value = value;
        },
      });
    };
    return () => {
      // 没有数据，显示按钮.点击按钮配置下来选项
      return (
        <div>
          {!data.value ||
            (data.value.length == 0 && (
              <ElButton onClick={editSelect}>添加</ElButton>
            ))}
          {(data.value || []).map((item) => (
            <ElTag onClick={editSelect}>
              {item[props.propConfig.table.key]}
            </ElTag>
          ))}
        </div>
      );
    };
  },
});
