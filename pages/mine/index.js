const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: app.globalData.userInfo,
    isSign: false,
    cartNum: 0,
    userConfig: {}
  },
  onLoad (option) {
    if (option.scene) {
      wx.setStorageSync('scene', option.scene)
    }
  },
  onShow () {
    this.getData()
    this.setData({
      cartNum: app.globalData.cartNum
    })
    this.getConfig()
  },
  onUnload () {
    clearTimeout(this.timer)
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
  //转发
  onShareAppMessage1: function (res) {
    console.log("button分享页面的内容")
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '个人中心',
      path: `/pages/mine/index?scene=${app.globalData.userInfo.invitation_code}`,
      success: function (res) {  // 不再支持分享回调参数 success 、fail 、complete
        console.log('成功', res)
      }
    }
  },
  async getConfig () {
    const res = await app.fetch({url: "GetSysConfig.ashx"})
    console.log(res)
    this.setData({
      userConfig: res.userConfig
    })
  },
  // 完成签到任务
  async getSign  ({currentTarget}) {
    if (this.data.detail.is_signin) return;
    
    const type = currentTarget.dataset.type
    const data = {
      type
    }
    await app.fetch({url: "AddPoints.ashx", data})

    app.toast('签到成功')
    this.setData({
      ['detail.is_signin']: true
    })
  },
  onChangeOrder: app.throttle(function({detail}){
    if (detail == 4) {
      wx.navigateTo({
        url: `/pageSub/afterSales/orderList/index?index=${detail}`
      })
      return false
    }
    wx.navigateTo({
      url: `/pageSub/mine/orderList/index?index=${detail}`
    })
  }),
  goWalletUrl: app.throttle(function(){
    wx.navigateTo({
      url: `/pageSub/wallet/wallet/index`
    })
  }),
});