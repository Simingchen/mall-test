const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    OriginalPhone: "",
    Phone: "",
    ValidateCode: "",
    isOriginalPhone: false,
    isCanSubmit: false,
    isSubmiting: false,
    isSendCode: false,
    seconds: 60,
  },
  async onShow () {
    const phone = await app.fetch({url: 'api/C/Common/MiniApp/GetMyPhone'})
    if (phone) {
      this.setData({isOriginalPhone: true})
    }
  },
  changeInput ({currentTarget, detail}) {
    this.setData({
      [currentTarget.dataset.tag]: detail.value.trim()
    })
    // this.canSubmit()
  },
  async getCode () {
    const {isSendCode, Phone } = this.data
    if (isSendCode) return;

    if (!Phone.length) {
      wx.showToast({
        title: '获取验证码手机号不能为空',
        icon: "none"
      })
      return false
    }
    if (!(/^1[3456789]\d{9}$/.test(Phone))) {
      wx.showToast({
        title: '手机号码格式有误',
        icon: "none"
      })

      return false
    }

    const data = {
      Type: 2, // 用户注册 = 1, 更换手机号码 = 2,
      Phone: this.data.Phone,
    }
    await app.fetch({url: 'api/C/Anonymous/ValidateCode/SendCode', data})
    this.showToast("短信验证码已经发送,注意查收,长时间未收到短信请点击重新发送")
    this.setTimer()
    this.setData({isSendCode: true})
  },
  setTimer () {
    clearInterval(this.timer)
    let seconds = this.data.seconds
    this.timer= setInterval(() => {
      seconds --

      if (seconds <= 0) {
        clearInterval(this.timer)
        this.setData({isSendCode: false, seconds: 60})
        return false;
      }

      this.setData({seconds})
    }, 1000)
  },
  showToast (title) {
    wx.showToast({
      title,
      icon: "none"
    })
  },
  canSubmit() {
    let isCanSubmit = true
    const {
      OriginalPhone,
      Phone,
      ValidateCode,
    } = this.data

    if (!OriginalPhone.length || !Phone.length || !ValidateCode.length) {
      isCanSubmit = false
    }

    if (!OriginalPhone.length || !(/^1[3456789]\d{9}$/.test(OriginalPhone))) {
      isCanSubmit = false
    }
    if (!Phone.length || !(/^1[3456789]\d{9}$/.test(Phone))) {
      isCanSubmit = false
    }

    this.setData({isCanSubmit})
  },
  // (12)设置手机号码
  async setPhone () {
    const {
      OriginalPhone,
      Phone,
      ValidateCode,
      isOriginalPhone
    } = this.data

    const data = {
      OriginalPhone,
      Phone,
      ValidateCode,
    }
    if (isOriginalPhone) {
      if (!OriginalPhone.length) {
        this.showToast("原手机号不能为空")
        return false
      }
      if (!(/^1[3456789]\d{9}$/.test(OriginalPhone))) {
        this.showToast("原手机号格式有误")
        return false
      }
    }
    
    if (!Phone.length) {
      this.showToast("新手机号不能为空")
      return false
    }
    if (!(/^1[3456789]\d{9}$/.test(Phone))) {
      this.showToast("新手机号格式有误")
      return false
    }

    if (!ValidateCode.length) {
      this.showToast("验证码不能为空")
      return false
    }

    this.setData({isSubmiting: true})
    await app.fetch({method: "post", url: 'api/C/Common/MiniApp/SetMyPhone', data })
    this.setData({isSubmiting: false})

    wx.showToast({
      title: '更换成功',
      icon: "none",
      success () {
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      }
    })
  }
});
