const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    detail: {},
    checked: false,
  },
  onLoad(option) {
    if (option.item) {
      let detail = JSON.parse(decodeURIComponent(option.item));
      this.setData({
        detail
      })
    };
  },
  onChange(event) {
    this.setData({
      checked: event.detail,
    });
  },
  async onSubmit() {
    if (!this.data.checked) {
      return app.toast('请先勾选确认协议')
    }

    const data = {
      uid: app.globalData.userInfo.id
    }
    await app.fetch({ url: "Api/user/upJxs", data })

    // 更改用户状态
    // app.globalData.userInfo.type = 2

    // wx.setStorageSync("userInfo", app.globalData.userInfo);

    app.toast('请耐心等待等待客服人员审核通过，或主动联系客服人员处理（【我的】--【我的咨询】即可联系客服）')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 1000)
  },
  // 下载文件
  openFile: app.throttle(function () { //节流
    wx.downloadFile({
      url: "https://miniapp.lhssbio.com/Public/Uploads/pdf/dfxy.pdf",
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

});