const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    name: "测试直播房间1",  // 房间名字
    coverImg: "",   // 通过 uploadfile 上传，填写 mediaID
    maxDay: '',   // 有效时间, 一个礼拜后
    startDay: '',   // 开始时间
    startTime: '09:00',   // 开始时间
    endDay: '',
    endTime: '09:00', // 结束时间
    anchorName: "zefzhang1",  // 主播昵称
    anchorWechat: "WxgQiao_04",  // 主播微信号
    subAnchorWechat: "WxgQiao_03",  // 主播副号微信号
    createrWechat: 'test_creater', // 创建者微信号
    shareImg: "" ,  //通过 uploadfile 上传，填写 mediaID
    feedsImg: "",   //通过 uploadfile 上传，填写 mediaID
    isFeedsPublic: 1, // 是否开启官方收录，1 开启，0 关闭
    type: 1 , // 直播类型，1 推流 0 手机直播
    screenType: 0,  // 1：横屏 0：竖屏
    closeLike: 0 , // 是否 关闭点赞 1 关闭
    closeGoods: 0, // 是否 关闭商品货架，1：关闭
    closeComment: 0, // 是否开启评论，1：关闭
    closeReplay: 1 , // 是否关闭回放 1 关闭
    closeShare: 0,   //  是否关闭分享 1 关闭
    closeKf: 0, // 是否关闭客服，1 关闭
  },
  onShow () {
    this.getStartDay()
  },
  // 开始日期
  getStartDay ( ) {
    function to10 (data) {
      return data < 10 ? ('0' + data) : data
    }
    const now = new Date().getTime() + (10 * 60 * 1000)  // 10分钟后
    const now10 = new Date().getTime() + (20 * 60 * 1000)  // 20分钟后
    const d = new Date(now)
    const d1 = new Date(now10)
    const startDay = `${d.getFullYear()}-${to10(d.getMonth() + 1)}-${to10(d.getDate())}`
    const startTime = `${d.getHours()}:${d.getMinutes()}`
    const endTime = `${d1.getHours()}:${d1.getMinutes()}`
    this.setData({
      startDay,
      startTime,
      endTime,
      endDay: startDay,
    })
    console.log(startTime)
  },
  // 时间变更
  bindTimeChange ({detail, currentTarget}) {
    const type = currentTarget.dataset.type
    console.log(detail)
    this.setData({
      [type]: detail.value
    })
  },
  async getData () {
    const detail = await app.fetch({url: "GetUserInfo.ashx"})
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