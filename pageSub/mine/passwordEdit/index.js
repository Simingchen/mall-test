const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    password: '',
    phone: '',
  },
  changeInput ({currentTarget, detail}) {
    console.log(detail)
    this.setData({
      [currentTarget.dataset.tag]: detail.trim()
    })
  },
  // 保存地址
  async save() {
    const par = this.data

    if (!par.phone.length) {
      return app.toast('手机号不能为空')
    }
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(par.phone)) {
      return app.toast('手机号格式不正确')
    }

    if (!par.password.length) {
      return app.toast('支付密码不能为空')
    }
    if (par.password.length < 6) {
      return app.toast('支付密码长度不小于6位')
    }

    const data = {
      "uid": app.globalData.userInfo.id,
      "phone": par.phone,
      "password": par.password,
    }
    const res = await app.fetch({
      url: "Api/Wallet/wallet_setting",
      data
    })

    app.toast('保存成功')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 500)
  },
});