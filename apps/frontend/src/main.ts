import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import * as echarts from "echarts";

// 注册中国地图
import chinaJson from "@/assets/map/china.json";
echarts.registerMap('china', chinaJson as any)

createApp(App).use(createPinia()).use(router).mount("#app");
