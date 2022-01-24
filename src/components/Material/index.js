import { ElButton, ElInput, ElDialog } from "element-plus";
import "element-plus/dist/index.css";
let els = [ElButton, ElInput, ElDialog];
export default {
  useElementPlus: (app) => {
    els.forEach((item) => {
      app.component(item.name, item);
    });
  },
};
