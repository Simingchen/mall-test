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
    this.setData({
      config: app.globalData.config
    })

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

      this.getData(detail.MeetingId || detail.Id)

    } catch (e) {
      console.error(e)
    }
    // scene=ICode%3Dbf9871%26id%3D99
  },
  async getData(Id) {
    let detail = await app.fetch({
      url: "api/C/Anonymous/Meeting/GetDetail",
      data: {
        Id
      }
    })
    // 401.3 表示用户没有权限
    this.setData({
      loadStatus: detail == 401.3 ? 'noAuth' : '',
    })
    if (detail == 401.3) return;

    this.setInfo(detail)

    this.getFile(detail.MeetingId, 0)
    this.getFile(detail.MeetingId, 1)


    // 获取相关推荐
    this.selectComponent("#recommend").getList(Id, 5)

    // 上报记录
    app.setRecord(5, Id)
  },
  // 获取活动资料
  async getFile(Id, Type) {
    let fileList = await app.fetch({
      url: "api/C/Anonymous/Meeting/GetDownLoad",
      data: {
        Id,
        Type
      }
    })
    this.setData({
      ['fileList' + Type]: fileList
    })
  },
  // 下载文件
  downFile: app.throttle(function ({
    currentTarget
  }) { //节流
    const item = currentTarget.dataset.item
    wx.downloadFile({
      url: item.Url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          showMenu: true,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
      }
    })
  }),
  setInfo(detail) {
    if (detail.Lables && !Array.isArray(detail.Lables)) {
      detail.Lables = detail.Lables.split(',')
    }

    this.setData({
      detail
    })
    if (detail.Content) {
      wxparse.wxParse('content', 'html', detail.Content, this, 5)
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
    //     -100:（未登录状态，显示：我要报名，可点击，点击要求登录）     
    // 100:（显示：我要报名，可点击）
    //   -2:（显示：已经截止报名，灰色，不可点击）
    //   0:（显示：确认报名，可点击）
    //   1:（显示：报名成功，灰色，不可点击）
    //   2:（显示：平台审核中，灰色，不可点击）

    const {
      detail
    } = this.data
    if (detail.StatusDesc != '进行中') {
      app.toast(`活动${detail.StatusDesc}`)
      return false
    }

    if (!this.data.userInfo.WxAvatarUrl || detail.ApplyStatus == -100) {
      app.toast("请先登录")
      setTimeout(() => {
        wx.navigateTo({
          url: "/pages/login/index"
        })
      }, 1000)
      return false
    }

    if (detail.ApplyStatus == -2 || detail.ApplyStatus == 1 || detail.ApplyStatus == 2) {
      return false;
    };

    // 活动名称{{thing1.DATA}}
    // 活动日期{{date2.DATA}}
    // 活动地址{{thing8.DATA}}
    // 温馨提醒{{thing10.DATA}}
    const temp = {
      thing1: {
        value: detail.Theme
      },
      date2: {
        value: detail.StartTime
      },
      thing8: {
        value: detail.PczName + detail.Address
      },
      thing10: {
        value: "活动即将开始，点击下方进入活动页面！"
      },
    }
    // phone_number8: {value: detail.Phone},
    const item = encodeURIComponent(JSON.stringify(temp))
    wx.navigateTo({
      url: `/pageSub/event/signUp/index?id=${detail.MeetingId}&item=${item}`,
    })
  }),
  // 链接跳转
  goCompany: app.throttle(function ({
    currentTarget
  }) { //节流
    const curItem = currentTarget.dataset.item
    const item = encodeURIComponent(JSON.stringify(curItem))
    if (curItem.EnterpriseId != -999 && curItem.EnterpriseId < 0) return;

    const url = curItem.EnterpriseId == -999 ? `/pageSub/mine/aboutUs/index` : `/pageSub/card/companyCard/index?item=${item}`
    wx.navigateTo({
      url
    })
  }),
  async collect() {
    const {
      detail
    } = this.data
    const data = {
      type: 5,
      id: detail.MeetingId
    }
    await app.fetch({
      url: "api/C/Common/Collect/SetCollect",
      data
    })

    wx.showToast({
      title: !detail.IsCollect ? '收藏成功' : '已经取消收藏',
      icon: 'none'
    })
    this.setData({
      ['detail.IsCollect']: !detail.IsCollect
    })
  },
  onCollect({
    detail
  }) {
    this.setData({
      ['detail.IsCollect']: detail.isCollect
    })
  },
  //转发
  onShareAppMessage: function (res) {
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