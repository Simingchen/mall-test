const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");

Page({
  data: {
    detail: {},
    isDig: false,
    digNum: 0,
  },
  onLoad (option) {

    if(option.item) {
      const detail = JSON.parse(decodeURIComponent(option.item));
      console.log(detail)
      this.setData({
        detail
      })

      this.getData(detail.id)
      this.getDig(detail.id)
      this.getIsDig(detail.id)
    };
  },

  async getData (id) {
    let detail = await app.fetch({url: "Api/Article/detail", data: {id} })
    this.setData({
      detail
    })

    if (detail.content) {
      wxparse.wxParse('content', 'html', detail.content, this, 5)
    }
  },
  // 数据上报
  async dataReport (id) {
    let detail = await app.fetch({url: "/Api/Article/zan", data: {id} })
  },
  // 点赞数
  async getDig (id) {
    let digNum = await app.fetch({url: "/Api/Article/zan", data: {aid: id} })
    this.setData({
      digNum
    })
  },
  // 是否点赞
  async getIsDig (id) {
    const data = {
      "uid": app.globalData.userInfo.id,
      aid: id,
      action: 'add'
    }
    let res = await app.fetch({url: "/Api/Article/zan", data })
    
    if (res.code == 201) {
      this.setData({
        isDig: true,
      })
    }
  },
  // 点赞
  dig: app.throttle(async function () {
    const data = {
      "uid": app.globalData.userInfo.id,
      aid: this.data.detail.id
    }
    if (!this.data.isDig) {
      await app.fetch({url: "Api/Article/zan", data: {
        ...data,
        action: 'add'
      } })
      this.setData({
        isDig: true,
        digNum: parseFloat(this.data.digNum) + 1
      })
      return false
    } else {
      app.toast("你已点赞")
    }
  }),
  //转发
  onShareAppMessage1 (res) {
    console.log("button分享页面的内容")
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    const { detail } = this.data
    const item = encodeURIComponent(JSON.stringify({
      Id: detail.NewsId
    }))
    return {
      title: detail.Title,
      path: `/pageSub/index/infoDetail/index?item=${item}&scene=${app.globalData.userInfo.invitation_code}`,
      success: function (res) {  // 不再支持分享回调参数 success 、fail 、complete
        console.log('成功', res)
      }
    }
  },
});