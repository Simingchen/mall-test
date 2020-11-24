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
    curPayRadio: '3',
    isShowPayPop: false,
    isShowAddrList: false,
    isShowAddrEdit: false,
    payList: [
      {id: 4, title: '微信支付'},
      {id: 3, title: '余额支付'},
    ],
    addressInfo: {
      name: "",
      tel: "",
      province: "",
      city: "",
      county: "",
      addressDetail: "",
    },
  },
  async onLoad (option) {
    try {
     if(option.item) {
      wx.showLoading({
        title: '加载中',
      })
      const data = JSON.parse(decodeURIComponent(option.item));
        
       await app.fetch({url: "BuyCartGoods.ashx", data })
       const detail = await app.fetch({url: "GetOrderInfo.ashx" })
       
       this.setData({
        detail,
        goodsJsonData: data.goodsJsonData
       }, () => {
        wx.hideLoading()
      })
     };
     
   } catch (e) {
     console.error(e)
   }
   this.GetExpressList()
 },
 onShow() {
  this.getAddrList()
 },
 // 留言
 onChangeMsg({detail}) {
  this.setData({
    message: detail
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
    "page_size":"10",
    "page_index":"0"
  }
  const res = await app.fetch({method: 'post', url: "GetUserAddrBookList.ashx", data })
  res.list.forEach(item => {
    item.area = item.area.replace(/,/g, ' ')
  })

  const defaultList = res.list.filter(item => item.is_default)
  let curAddress = {}
  // 没有默认地址悬着第一个
  if (!defaultList.length) {
    curAddress = res.list[0]
  } else {
    curAddress = defaultList[0]
  }

  this.setData({
    addrlist: res.list,
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
    const { curAddress, curExpress, curPay, goodsJsonData, message } = this.data

    const area = curAddress.area.split(',')
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
      const par2 = {
        pay_order_no: resOrder.order_no
      }
      await app.fetch({url: "api/payment/balance/index.ashx", data: par2 })

      app.toast('支付成功')

      setTimeout(() => {
        wx.redirectTo({
          url: '/pageSub/mine/orderList/index?index=1',
        })
      }, 1000)
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
  }
});