const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    bannerList: [],
    msgList: [],
  },
  async onLoad (option) {
    console.log(option)
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
    let goodsList = await app.fetch({url: "Api/goods/glist"})
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