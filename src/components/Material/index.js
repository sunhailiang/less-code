import { ElButton, ElInput, ElDialog, ElSelect, ElOption } from "element-plus";
import "element-plus/dist/index.css";
let els = [ElButton, ElInput, ElDialog, ElSelect, ElOption];
export default {
  useElementPlus: (app) => {
    els.forEach((item) => {
      app.component(item.name, item);
    });
  },
};
