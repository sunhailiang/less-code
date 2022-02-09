import { defineComponent, inject, reactive, watch } from "vue";
import deepcopy from "deepcopy";
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElInputNumber,
  ElColorPicker,
  ElSelect,
  ElOption,
} from "element-plus";
import "./index.less";
import useTop from "../editor-utils/top";
import selectEditor from "./utils/select-editor";
export default defineComponent({
  props: {
    lastSelectBlock: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  setup(props) {
    // 获取实时注入的config数据
    let config = inject("config");
    const state = reactive({
      editData: {},
    });
    // 重置
    const reset = () => {
      // 如果没有选中，那么默认给画布宽高
      if (!props.lastSelectBlock) {
        state.editData = deepcopy(props.data.value.container);
      } else {
        // 选中元素，则展示元素的具体参数数值
        state.editData = deepcopy(props.lastSelectBlock);
      }
    };
    // 应用-点击确认更新json数据，样式生效
    let { commands } = useTop(props.data);
    const apply = () => {
      // 如果没有选中，设置画布大小
      if (!props.lastSelectBlock) {
        commands.updateContainer({
          ...props.data,
          container: state.editData,
        });
      } else {
        // 设置元素属性
        commands.updateBlock(state.editData, props.lastSelectBlock);
      }
    };

    // 观察最后一个选中的元素，如果变化立马更新
    watch(() => props.lastSelectBlock, reset, { immediate: true });

    return () => {
      let content = [];
      // 默认没有选中元素时，右侧属性菜单，展示画布宽高
      if (!props.lastSelectBlock) {
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="背景颜色">
              <ElColorPicker
                v-model={state.editData.background}
              ></ElColorPicker>
            </ElFormItem>
          </>
        );
      } else {
        // 匹配最后一个选中的元素
        let component = config.componentMap[props.lastSelectBlock.key];
        // 拿到选中元素挂载的属性，生成菜单
        if (component && component.props) {
          let res = Object.entries(component.props).map(
            ([propsname, propconfig]) => {
              return (
                <ElFormItem label={propconfig.label}>
                  {{
                    input: () => (
                      <ElInput
                        v-model={state.editData.props[propsname]}
                      ></ElInput>
                    ),
                    color: () => (
                      <ElColorPicker
                        v-model={state.editData.props[propsname]}
                      ></ElColorPicker>
                    ),
                    select: () => (
                      // select 类型的获取option
                      <ElSelect v-model={state.editData.props[propsname]}>
                        {propconfig.option.map((option) => {
                          return (
                            <ElOption
                              label={option.label}
                              value={option.value}
                            ></ElOption>
                          );
                        })}
                      </ElSelect>
                    ),
                    table: () => (
                      <selectEditor
                        propConfig={propconfig}
                        v-model={state.editData.props[propsname]}
                      />
                    ),
                  }[propconfig.type]()}
                </ElFormItem>
              );
            }
          );
          content.push(res);
        }

        // 通过判断组件的model字段判断是否可以绑定字段，数据双向绑定
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]}></ElInput>
                </ElFormItem>
              );
            })
          );
        }
      }
      return (
        <ElForm labelPosition="top" class="right-form">
          {content}

          <ElFormItem>
            <ElButton onClick={apply} type="primary">
              应用
            </ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
