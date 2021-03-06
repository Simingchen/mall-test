const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    isEdit: false, // 是否是编辑状态
    imgList: ['01', '02','03', '04','05', '06','07', '08','09', '10']
  },
  onLoad (option) {
    // 存储邀请码
    if (option.scene) {
      const par = decodeURIComponent(option.scene)
      console.log(par)
      const ICode = app.getQueryString(par, 'uid')
      wx.setStorageSync('ICode', ICode)
    }
  },
  // 去逛逛
  goUrl: app.throttle(function () {
    wx.switchTab({
      url: '/pages/goodsSort/index',
    })
  }),
});