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
    cardList: [],
    serviceFee: 0, // 手续费
  },
  onLoad (option) {
    
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
      isShowCardPop: false,
      isShowPayPop: false
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
  // 银行卡，金额数
  async getData () {
    const data = {
      uid: app.globalData.userInfo.id
    }
    const detail = await app.fetch({url: "Api/Wallet/index", data})
    this.setData({detail})

    const res = await app.fetch({url: "Api/Wallet/bank", data })

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
 // 输入框更改
 onChangeInput({currentTarget, detail}) {
  const string = detail.trim()
  this.setData({
    [currentTarget.dataset.type]: string
  }, () => {
    if (currentTarget.dataset.type == "payPassword") {
      if (string.length > 5) {
        this.submit(string)
      }
    }
  })
  },
  async confirm () {
    const { detail, value, } = this.data
    if (!value.length) {
      return app.toast('提现金额数不能为空')
    }
    if (value < 100) {
      return app.toast('提现金额数不能小于100')
    }
    if (detail.avail_money < 100) {
      return app.toast('当前可提现金额小于100')
    }

    if (value > 30000 || value < 100) {
      return app.toast('提现金额数范围 100~30000')
    }

    if (value > detail.avail_money) {
      return app.toast('提现金额数不能大于可提现数额')
    }

    this.setData({
      isShowPayPop: true,
      serviceFee: parseFloat(value) * 6 / 1000
    })
  },
  async submit(password) {
    const { value, curCard } = this.data
    const data = {
      fee: value,
      "uid": app.globalData.userInfo.id,
      bank_id: curCard.id,
      password,
    }
    await app.fetch({url: "Api/wallet/cashOut", data})

    app.toast('提现申请成功，请耐心等待！')

    this.timer = setTimeout(() => {
      wx.navigateTo({url: "/pageSub/wallet/withdrawList/index"})
    }, 800)
  }
});