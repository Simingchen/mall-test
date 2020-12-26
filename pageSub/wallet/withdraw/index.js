const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: {},
    value: '',
    isShowCardPop: false,
    curCardRadio: 0,
    curCard: {
      card: ''
    },
    cardList: []
  },
  onLoad (option) {
    // this.setData({
    //   detail: app.globalData.userInfo
    // })
  },
  onShow () {
    this.getData()
  },
  openPop() {
    this.setData({
      isShowCardPop: true
    })
  },
  onClosePop() {
    this.setData({
      isShowCardPop: false
    })
  },
  onChangeRadio(event) {
    const curCard = this.data.cardList.filter(i => i.id == event.detail)
    this.setData({
      curCardRadio: event.detail,
      curCard: curCard[0],
      isShowCardPop: false
    });
  },
  async getData () {
    let par = {
      "uid": app.globalData.userInfo.id,
    }
    
    const res = await app.fetch({url: "Api/Wallet/bank", data: par })

    this.setData({
      cardList: res,
      curCard: res[0]
    })
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
  async confirm () {
    console.log(this.data.value)
    const { detail, value } = this.data
    if (!value.length) {
      return app.toast('提现金额不能为空')
    }
    if (value > detail.amount) {
      return app.toast('提现金额大于可提现数额')
    }
    if (value > 5000 || value < 1) {
      return app.toast('提现金额范围 1~5000')
    }

    const data = {
      amount: value
    }
    await app.fetch({url: "WxTransfers.ashx", data})

    app.toast('提现申请成功，请耐心等待！')

    this.timer = setTimeout(() => {
      wx.navigateTo({url: "/pageSub/wallet/withdrawList/index"})
    }, 800)
    
  }
});