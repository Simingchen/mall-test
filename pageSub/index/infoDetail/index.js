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
    };
  },

  async getData (id) {
    let detail = await app.fetch({url: "Api/Article/detail", data: {id} })

    detail.post_date = this.filterTime(detail.post_date)

    console.log(detail)
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
  // 点赞
  dig: app.throttle(async function () {
    if (this.data.isDig) {
      await app.fetch({url: "/Api/Article/zan", data: {id: this.data.detail.id} })
      this.setData({
        isDig: false
      })
      return false
    }

    await app.fetch({url: "Api/Article/detail", data: {id: this.data.detail.id} })
    this.setData({
      isDig: true
    })

  }),
  filterTime: function (date) {
    date = new Date()
    console.log(date)
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  },
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