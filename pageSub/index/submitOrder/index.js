const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    goodsJsonData: {},   // 商品参数
    detail: {   // 订单信息

    },
    isLoaded: true,
    order: {
      detail: [],
    },
    message: "", // 留言
    totalPrice: 0,
    addrlist: [],
    curAddress: {},
    curAddressRadio: '',
    curExprsss: {},
    curExprsssRadio: '',
    isShowExpressPop: false,
    curPay: {},
    curPayRadio: 1,
    isShowPayPop: false,
    isShowAddrList: false,
    isShowAddrEdit: false,
    payList: [
      {id: 1, title: '微信支付', iconfont: 'iconweixin', color: "#02be03"},
      {id: 2, title: '余额支付', iconfont: 'iconyue', color: "#ffbd29"},
    ],
    payPhone: "",   // 支付号码
    payPassword: '',
    payPassword2: '',
    isSendCode: false,  // 是否已经发送支付验证码
    seconds: 60,
    imgCode: '',
    verifyCode: '',
    curExpressRadio: 1,
    order_no: '',    // 提交表单后的支付订单号
    userInfo: {},
    checkPay: {},   // 余额支付时检查是否设置密码，余额是否充足
  },
  async onLoad (option) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    try {
     if(option.item) {
      wx.showLoading({
        title: '加载中',
      })
      const detail = JSON.parse(decodeURIComponent(option.item));
       this.setData({
        detail,
        payPhone: wx.getStorageSync('userInfo').phone
       }, () => {
        wx.hideLoading()
      })
     };
     
   } catch (e) {
     console.error(e)
   }
  //  this.GetExpressList()
 },
 async onShow() {
  this.getAddrList()

  // 选择了余额支付查询是否设置过密码
    const par = this.data
    const data = {
      "uid": par.userInfo.id,
      fee: par.detail.realPrice * 100 * par.detail.quality / 100
    }
    const res = await app.fetch({url: "Api/wallet/wallet_check", data })

    console.log(res)
    
    this.setData({
      checkPay: res
    })
 },
 // 输入框更改
 onChangeInput({currentTarget, detail}) {
  this.setData({
    [currentTarget.dataset.type]: detail.trim()
  })
 },
 // 关闭弹窗
 onClosePop () {
  this.setData({
    isShowExpressPop: false,
    isShowAddrList: false,
    isShowPayPop: false
  })
 },
 // 获取物流列表
 async GetExpressList() {
  const expressList = await app.fetch({method: 'post', url: "GetExpressList.ashx" })

  this.setData({
    expressList,
    curExpress: expressList[0],
    curExpressRadio: expressList[0].id,
    curPay: this.data.payList[0]
  })
 },
 // 获取地址列表
 async getAddrList() {
  let data = {
    "uid": app.globalData.userInfo.id,
  }
  const res = await app.fetch({url: "Api/Address/address_list", data })

  const defaultList = res.filter(item => item.is_default > 0)
  // 没有默认地址选着第一个
  let curAddress = !defaultList.length ? curAddress = res[0] : defaultList[0]
  
  this.setData({
    addrlist: res,
    curAddress,
    curAddressRadio: curAddress.id,
  })
 },
 // 物流弹窗
 toggleExpressPop() {
  this.setData({
    isShowExpressPop: true
  })
 },
 // 支付弹窗
 togglePayPop(order_no) {
  this.setData({
    isShowPayPop: true,
    order_no
  })
 },
 
  // 地址弹窗
  toggleAddrPop () {
    // 没有地址跳转添加地址
    if (!this.data.curAddress.id) {
      return this.goUrl()
    }
    this.setData({
      isShowAddrList: true
    })
  },
  // 地址更改
  onChangeAddr (event) {
    console.log(event.detail)
    this.setData({
      curAddress: event.detail,
    });
  },
  // 地址更改
  onClickAddr ({currentTarget}) {
    const id = currentTarget.dataset.name
    const curAddress = this.data.addrlist.filter(item => item.id == id)[0]
    this.setData({
      curAddressRadio: id,
      curAddress: curAddress,
      isShowAddrList: false,
    });
  },
  // 支付方式更改
  async onChangePay ({detail}) {
    console.log(detail)
    this.setData({
      curPayRadio: detail,
    });
    
  },
  // 物流更改
  onClickExpress ({currentTarget}) {
    const id = currentTarget.dataset.name
    const curExpress = this.data.expressList.filter(item => item.id == id)[0]
    this.setData({
      curExpressRadio: id,
      curExpress: curExpress,
      isShowExpressPop: false,
    });
  },
  // 选择提货方式
  onChangeExpress({detail}) {
    console.log(detail)
    this.setData({
      curExpressRadio: detail,
    });
  },
  // 提交订单
  async onSubmit () {
    const { curAddressRadio, detail, message, curExpressRadio, curPayRadio, userInfo, checkPay} = this.data

    // 余额支付检查是否满足支付条件
    if (curPayRadio == 2) {
      if (!checkPay.IsEnoughPay) {
        // return app.toast('余额不足~')
      }
      if (!checkPay.IsSetPass) {
        app.toast('请先设置支付密码~')
        setTimeout(() => {
          wx.navigateTo({
            url: '/pageSub/mine/passwordEdit/index',
          })
        }, 1000)
        return false;
      }
    }

    const data = {
      "payway": curPayRadio,
      "good_id": detail.id,
      "uid": userInfo.id,
      pickup: curExpressRadio,
      address_id: curAddressRadio,
      buy_num: detail.quality,
      buy_price: detail.realPrice,
      total_price: detail.realPrice * 100 * detail.quality / 100,
      remark: message
    }
    console.log(curPayRadio)
    const res = await app.fetch({url: "Api/Order/submit", data })

    // 余额支付
    if (curPayRadio == 2) {
      this.togglePayPop(res.order_no)
      // const par2 = {
      //   pay_order_no: resOrder.order_no
      // }
      // await app.fetch({url: "api/payment/balance/index.ashx", data: par2 })

      // app.toast('支付成功')

      // setTimeout(() => {
      //   wx.redirectTo({
      //     url: '/pageSub/mine/orderList/index?index=1',
      //   })
      // }, 1000)
    }
    // 微信支付
    if (curPayRadio == 1) {
      this.wxPay(res.order_no, data.total_price)
    }
    
  },
  async wxPay (order_no, fee) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const par = {
      fee: fee,
      openid: userInfo.openid,
      "out_trade_no": order_no,
      body: '宫颜之禧-购物'
    }
    console.log(par)
    const respay = await app.fetch({url: "Api/Pay/pay", data: par })
    
    // 触发微信支付
    wx.requestPayment({
      'timeStamp': respay.timeStamp,
      'nonceStr': respay.nonceStr,
      'package': respay.package,
      'signType': 'MD5',
      'paySign': respay.paySign,
      'success': function (res) {
        app.toast('恭喜您，订单已成功提交！')
        setTimeout(() => {
          wx.redirectTo({
            url: '/pageSub/mine/orderList/index?index=1',
          })
        }, 1000)
      },
      'fail': function (res) {
          app.toast('支付未完成')
          wx.redirectTo({
            url: '/pageSub/mine/orderList/index?index=0',
          })
      }
    })
  },
  // 跳转到添加
  goUrl () {
    wx.navigateTo({
      url: '/pageSub/mine/addressEdit/index',
    })
  },
  async getCode () {
    console.log("sdf")
    const {isSendCode, payPhone } = this.data
    if (isSendCode) return;

    if (!payPhone.length) {
      app.toast('获取验证码手机号不能为空')
      return false
    }
    // if (!(/^1[3456789]\d{9}$/.test(Phone))) {
    //   wx.showToast({
    //     title: '手机号码格式有误',
    //     icon: "none"
    //   })

    //   return false
    // }

    const data = {
      Phone: payPhone,
    }
    // await app.fetch({url: 'api/C/Anonymous/ValidateCode/SendCode', data})
    app.toast("短信验证码已经发送,注意查收,长时间未收到短信请点击重新发送")
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
  // 余额确认支付
  confirmPay () {
    const { imgCode, verifyCode, payPassword, payPassword2 } = this.data
    if (!imgCode.length) {
      return app.toast('请输入图形验证码')
    }
    if (!verifyCode.length) {
      return app.toast('请输入手机验证码')
    }
    if (!payPassword.length) {
      return app.toast('请输入支付密码')
    }
    if (!payPassword2.length) {
      return app.toast('请再次输入支付密码')
    }
    if (payPassword != payPassword2) {
      return app.toast('再次输入的密码不一致')
    }
  }
});