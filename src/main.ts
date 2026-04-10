import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import "./style.css";
import { appName } from "./lib/featureFlags";

document.title = appName;

const app = createApp(App);
app.use(router);
app.mount("#app");
