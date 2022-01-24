import {
  defineComponent,
  createVNode,
  render,
  reactive,
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
} from "vue";
// import { ElDropdown } from "element-plus";
import "./style/index.less";
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
      top: 0,
      left: 0,
    });
    ctx.expose({
      showDropdown(option) {
        state.option = option;
        state.isShow = true;
        let { top, left, height, width } = option.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left + width;
      },
    });
    // 计算类名
    const classes = computed(() => [
      "dropdown",
      {
        "dropdown-isShow": state.isShow,
      },
    ]);

    // 计算显示位置
    const style = computed(() => ({
      top: state.top + "px",
      left: state.left + "px",
    }));
    // 点击非dropdown区域消失
    const el = ref(null);
    const onMousedownDocument = (e) => {
      // 点击的组件只要不在dropdown组件内，则隐藏
      if (!el.value.contains(e.target)) {
        state.isShow = false;
      }
    };
    // 组件挂载后监听点击事件，凡事点击dropdown意外的地方，组件隐藏
    onMounted(() => {
      document.body.addEventListener("mousedown", onMousedownDocument, true);
    });
    // 销毁监听事件
    onBeforeUnmount(() => {
      document.body.removeEventListener("mousedown", onMousedownDocument);
    });
    return () => {
      return (
        <div class={classes.value} style={style.value} ref={el}>
          菜单功能
        </div>
      );
    };
  },
});

let vm;
export function $Dropdown(option) {
  if (!vm) {
    // 手动挂载组件
    let el = document.createElement("div");
    // 创建虚拟节点
    vm = createVNode(DialogComponent, { option });
    // 渲染成时机节点
    document.body.appendChild((render(vm, el), el));
  }

  // 获取组件暴露的方法
  let { showDropdown } = vm.component.exposed;
  // 调用展示的方法
  showDropdown(option);
}
