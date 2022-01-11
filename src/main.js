import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import useComponent from "./components";
let app = createApp(App);
app.use(store).use(router).mount("#app");
// 使用公共组件
useComponent(app);
