const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");

Page({
  data: {
    detail: {},
  },
  onLoad (option) {
    if(option.id) {
      this.getData(option.id)
    };
  },

  async getData (id) {
    wx.showLoading({
      title: '加载中',
    })
    let res = await app.fetch({url: "GetOrderRefundDetails.ashx", data: {id} })

    wx.hideLoading()

    this.setData({
      detail: res
    }, () => {
      console.log(this.data.detail)
    })
  },
  copy() {
    wx.setClipboardData({
      data: this.data.detail.order_no,
      success: function(res) {
          console.log("复制成功")
      }
    })
  }
});