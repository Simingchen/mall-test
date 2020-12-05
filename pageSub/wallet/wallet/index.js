const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: app.globalData.userInfo,
  },
  onLoad (option) {
    if (option.scene) {
      wx.setStorageSync('scene', option.scene)
    }
  },
  onShow () {
    // this.getData()
  },
  async getData () {
    const detail = await app.fetch({method: 'post', url: "GetUserInfo.ashx"})
    app.globalData.userInfo = detail
    wx.setStorageSync('userInfo', detail)
    this.setData({detail})
  },
  goUrl: app.throttle(function({currentTarget}){  //节流
    // console.log("登录1111");
    const url = currentTarget.dataset.url
    if (!this.data.detail.WxAvatarUrl) {
      if (url.indexOf('login') == -1) {
        app.toast("请先登录")
      }
      
      this.timer = setTimeout(() => {
        wx.navigateTo({url: "/pages/login/index"})
      }, 800)
      return false
    }
    
    wx.navigateTo({ url })
  }),
});