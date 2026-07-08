import "./style.css";
import { restoreTheme } from "./utils/common";

restoreTheme();

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import i18n from "./i18n";
import { MotionPlugin } from "@vueuse/motion";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.use(MotionPlugin);
app.use(autoAnimatePlugin);
app.mount("#app");
