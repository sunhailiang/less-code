import { ElButton } from "element-plus";
import "element-plus/lib/";
let els = [ElButton];
export default (app) => {
  els.forEach((item) => {
    app.use(item);
  });
};
