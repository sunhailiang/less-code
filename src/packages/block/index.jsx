import { defineComponent, computed, inject, onMounted, ref } from "vue";
import "./index.less";
import Resize from "./components/resize/";
export default defineComponent({
  props: {
    block: {
      type: Object,
    },
    formData: {
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
        // 只有在拖动时元素居中

        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = props.block.left - offsetWidth / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = props.block.top - offsetHeight / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.alignCenter = false;
      }
      // eslint-disable-next-line vue/no-mutating-props
      props.block.height = offsetHeight;
      // eslint-disable-next-line vue/no-mutating-props
      props.block.width = offsetWidth;
    });
    return () => {
      const component = config.componentMap[props.block.key];
      // 此处render是组件自己的render，props:是该组件所有的可配置的属性
      const renderComponent = component.render({
        size: props.block.hasResize
          ? { width: props.block.width, height: props.block.height }
          : {},
        props: props.block.props,
        // 通过model实现数据绑定，以及通过onUpdate:modelValue数据双向绑定
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          let propName = props.block.model[modelName];
          prev[modelName] = {
            modelValue: props.formData[propName],
            // eslint-disable-next-line vue/no-mutating-props
            "onUpdate:modelValue": (v) => (props.formData[propName] = v),
          };
          return prev;
        }, {}),
      });
      // 可视化调整元素宽高
      const { width, height } = component.resize || {};
      return (
        <div class="block" style={blockStyle.value} ref={blockRef}>
          {renderComponent}
          {/* 获取焦点后如果有width或者height那么就展示可拖拽的样式 */}
          {/* 传递block修改当前元素宽高，传递component可以确认修改宽度还是高度 */}
          {props.block.focus && (width || height) && (
            <Resize block={props.block} component={component}></Resize>
          )}
        </div>
      );
    };
  },
});
