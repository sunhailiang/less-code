import { defineComponent, computed, inject, onMounted, ref } from "vue";
import "./index.less";
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
        props: props.block.props,
      });
      return (
        <div class="block" style={blockStyle.value} ref={blockRef}>
          {renderComponent}
        </div>
      );
    };
  },
});
