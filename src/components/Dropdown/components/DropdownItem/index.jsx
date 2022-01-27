import { defineComponent, inject } from "vue";
import "./style/index.less";
export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: String,
  },
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    let { label, icon } = props;
    // 点击后关闭
    let dropdownHide = inject("dropdownHide");
    return () => (
      <div class="dropdown-item" onClick={dropdownHide}>
        <i class={icon}></i>
        <span>{label}</span>
      </div>
    );
  },
});
