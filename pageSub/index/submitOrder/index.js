const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    goodsJsonData: {},   // 商品参数
    detail: {   // 订单信息
      GoodsTotal: {
        total_num: 0,
        total_quantity: 0,
        payable_amount: 0,
        real_amount: 0,
        total_point: 0
      },
      GoodsList: []
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
    curPayRadio: 3,
    isShowPayPop: false,
    isShowAddrList: false,
    isShowAddrEdit: false,
    payList: [
      {id: 4, title: '微信支付'},
      {id: 3, title: '余额支付'},
    ],
    payPhone: "",   // 支付号码
    payPassword: '',
    payPassword2: '',
    isSendCode: false,  // 是否已经发送支付验证码
    seconds: 60,
    imgCode: '',
    verifyCode: ''
  },
  async onLoad (option) {
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
 onShow() {
  this.getAddrList()
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
 togglePayPop() {
  this.setData({
    isShowPayPop: true
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
  onClickPay ({currentTarget}) {
    const id = currentTarget.dataset.name
    const curPay = this.data.payList.filter(item => item.id == id)[0]
    console.log(curPay)
    this.setData({
      curPayRadio: id,
      curPay: curPay,
      isShowPayPop: false,
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
  // 提交订单
  async onSubmit () {
    this.togglePayPop()
    return false
    const { curAddress, curExpress, curPay, goodsJsonData, message } = this.data

    console.log(goodsJsonData)
    const data = {
      goodsJsonData,
      "payment_id": curPay.id,
      "express_id": curExpress.id,
      "accept_name": curAddress.accept_name,
      "mobile": curAddress.mobile,
      "province": area[0],
      "city": area[1],
      "area": area[2],
      "address": curAddress.address,
      remark: message
    }
    const resOrder = await app.fetch({url: "SaveOrder.ashx", data })

    console.log(resOrder)

    // 余额支付
    if (curPay.id == 3) {
      this.togglePayPop()
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
    if (curPay.id == 4) {
      this.wxPay(resOrder)
    }
    
  },
  async wxPay (resOrder) {
    const par = {
      "pay_order_no": resOrder.order_no,
	    "pay_order_amount":"1"
    }
    console.log(par)
    const respay = await app.fetch({url: "api/payment/wxapipay/index.ashx", data: par })
    console.log("123456")
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