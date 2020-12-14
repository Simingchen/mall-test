const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    detail: {},
    name: '',
    phone: '',
  },
  onLoad(option) {
    if (option.item) {
      let detail = JSON.parse(decodeURIComponent(option.item));
      this.setData({
        detail
      })
    };
  },
    // 输入框更改
 onChangeInput({currentTarget, detail}) {
  this.setData({
    [currentTarget.dataset.type]: detail.trim()
  })
 },
  // 保存
  async save() {
    const par = this.data

    if (!par.name.length) {
      return app.toast('姓名不能为空')
    }
    if (!par.phone.length) {
      return app.toast('手机号不能为空')
    }
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(par.phone)) {
      return app.toast('手机号格式不正确')
    }
    const userInfo = wx.getStorageSync('userInfo') || {}
    const data = {
      id: this.data.detail.id,
      name: par.name,
      phone: par.phone,
      openid: userInfo.openid,
    }

    const res = await app.fetch({
      url: "Api/Huodong/huodong_baoming",
      data
    })

    app.toast('报名成功')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 500)
  },
  // 删除地址
  remove() {
    wx.showModal({
      title: "提示",
      content: "删除当前地址？",
      success: async(res) => {
        if (res.confirm) {
          console.log('用户点击确定')

          const data = {
            id: this.data.id
          }
          const res = await app.fetch({
            url: "Api/Address/address_del",
            data
          })
      
          app.toast('删除成功')
      
          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 500)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
});