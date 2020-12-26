const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: {},
    isAddCard: false
  },
  onLoad (option) {
    if (option.scene) {
      wx.setStorageSync('scene', option.scene)
    }
  },
  onShow () {
    this.getData()
  },
  async getData () {
    const data = {
      uid: app.globalData.userInfo.id
    }
    const detail = await app.fetch({url: "Api/Wallet/index", data})
    this.setData({detail})

    let par = {
      "uid": app.globalData.userInfo.id,
    }
    
    const res = await app.fetch({url: "Api/Wallet/bank", data: par })

    this.setData({
      isAddCard: res.length > 0
    })
  },
  goUrl: app.throttle(function({currentTarget}){  //节流
    const url = currentTarget.dataset.url
    // 添加了银行卡才可提现
    if (this.data.isAddCard) {
      return wx.navigateTo({ url })
    }

    wx.showModal({
      // title: "提示",
      content: "使用提现功能需要添加一张支持提现的储蓄卡",
      confirmText: '去添加',
      confirmColor: "#00a5a5",
      success: async(res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.navigateTo({
            url: `/pageSub/wallet/cardEdit/index?item={}`,
          })
          
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }),
});