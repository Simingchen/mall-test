const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    bannerList: [],
    msgList: [],
  },
  async onLoad (option) {
    // 存储邀请码
    if (option.scene) {
      const par = decodeURIComponent(option.scene)
      const ICode = app.getQueryString(par, 'uid')
      wx.setStorageSync('ICode', ICode)
    }
    this.getBanner()

    this.getList()
  },
  async getBanner () {
    let bannerList = await app.fetch({url: "Api/goods/index"})
    this.setData({
      bannerList
    })
  },
  async getList () {
    let goodsList = await app.fetch({url: "Api/goods/glist", data: {
      type: app.globalData.userInfo.type || ''
    }})
    this.setData({
      goodsList
    })
  },
  goDetail: app.throttle(function({currentTarget}){  //节流
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/index/goodsDetail/index?item=${item}`,
    })
  }),
});