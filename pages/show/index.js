const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    isEdit: false, // 是否是编辑状态
  },
  onShow() {
  },
  // 去逛逛
  goUrl: app.throttle(function () {
    wx.switchTab({
      url: '/pages/goodsSort/index',
    })
  }),
});