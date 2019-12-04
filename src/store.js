import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 使用CDN用来加速图片等资源的访问速度 如果不使用 那么设置为空字符串就可以了
    // CDNURL: ""
    CDNURL: "https://ynjd.cn-bj.ufileos.com"
  },
  mutations: {},
  actions: {}
});
