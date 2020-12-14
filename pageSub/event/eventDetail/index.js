const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");

Page({
  data: {
    isNoGlobalShare: true, // 不使用全局分享
    goodsList: [],
    detail: {},
    active: 0,
    fileList0: [],
    fileList1: [],
    config: {},
    userInfo: {}
  },
  onShow() {
    const userInfo = app.globalData.userInfo
    console.log(userInfo)
    this.setData({
      userInfo
    })
  },
  onLoad(option) {
    let detail = {}

    if (option.scene) {
      const par = decodeURIComponent(option.scene)
      const ICode = app.getQueryString(par, 'ICode')
      detail.Id = app.getQueryString(par, 'id')
      wx.setStorageSync('ICode', ICode)
    }

    if (option.item) {
      detail = JSON.parse(decodeURIComponent(option.item));
      this.setInfo(detail)
    };

    try {
      if (!option.item) return;
      const detail = JSON.parse(decodeURIComponent(option.item));

      this.setInfo(detail)

      this.getData(detail.id)

    } catch (e) {
      console.error(e)
    }
    // scene=ICode%3Dbf9871%26id%3D99
  },
  async getData(id) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    let detail = await app.fetch({
      url: "Api/Huodong/huodong_detail",
      data: {
        id,
        openid: userInfo.openid,
      }
    })

    this.setInfo(detail)
  },
  setInfo(detail) {
    this.setData({
      detail
    })
    if (detail.content) {
      wxparse.wxParse('content', 'html', detail.content, this, 5)
    }
  },
  // tab 切换
  onChange(event) {
    // wx.showToast({
    //   title: `切换到标签 ${event.detail.name}`,
    //   icon: 'none',
    // });
  },
  // 报名
  signUp: app.throttle(function ({
    currentTarget
  }) { //节流
    const {
      detail
    } = this.data
    if (detail.huodong_status != 1) {
      const status = ['未开始','开始报名', '已结束'][detail.huodong_status]
      app.toast(`活动${status}`)
      return false
    }

    if (detail.is_baoming == 1) {
      app.toast(`您已报名~`)
      return false
    }

    const item = encodeURIComponent(JSON.stringify(detail))
    wx.navigateTo({
      url: `/pageSub/event/signUp/index?id=${detail.id}&item=${item}`,
    })
  }),
  //转发
  onShareAppMessage1: function (res) {
    console.log("button分享页面的内容")
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    const {
      detail
    } = this.data
    const item = encodeURIComponent(JSON.stringify({
      Id: detail.MeetingId
    }))
    app.setShare(5, detail.MeetingId)
    return {
      title: detail.Theme,
      path: `/pageSub/event/eventDetail/index?item=${item}&ICode=${app.globalData.userInfo.InvitationCode}`,
      success: function (res) { // 不再支持分享回调参数 success 、fail 、complete
        console.log('成功', res)
      }
    }
  },
});