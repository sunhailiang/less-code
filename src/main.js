import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { useElementPlus } from "./components";
let app = createApp(App);
app
  .use(store)
  .use(router)
  .use(useElementPlus.useElementPlus(app))
  .mount("#app");
