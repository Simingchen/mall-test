const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");

Page({
  data: {
    detail: {},
    isDig: false,
    digNum: 0,
  },
  onLoad (option) {

    if(option.item) {
      const detail = JSON.parse(decodeURIComponent(option.item));
      console.log(detail)
      this.setData({
        detail
      })

      this.getData(detail.id)
    };
  },

  async getData (id) {
    let detail = await app.fetch({url: "Api/Article/detail", data: {id} })
    this.setData({
      detail
    })

    if (detail.content) {
      wxparse.wxParse('content', 'html', detail.content, this, 5)
    }
  },
});