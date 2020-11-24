const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: {}
  },
  async onLoad () {
    this.get()
  },
  async get() {
    const data = {
      "page_size": "20",
      "page_index": "0",
      "category_id": "0"
    }
    const res = await app.fetch({ url: "GetVIPGoodsList.ashx", data})
    this.setData({
      detail: res.list[0]
    }, () => {
      console.log(this.data.detail)
    })

  },
  // 立即购买
  async buyIt () {
    const { detail } = this.data

    console.log(detail)
    const goodsJsonData = [{
        "article_id": detail.id,
        "goods_id": 0,
        "quantity": 1,
        channel_id: detail.channel_id
      }]

    const userInfo = wx.getStorageSync('userInfo')

    console.log(userInfo)
    const data = {
      goodsJsonData,
      "payment_id": 4,
      "express_id": 1,
      "accept_name": userInfo.nick_name,
      "mobile": '13800000000',
      "province": '北京市',
      "city": '市辖区',
      "area": '东城区',
      "address": '123',
    }
    const resOrder = await app.fetch({url: "SaveOrder.ashx", data })

    this.wxPay(resOrder)
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
        app.toast('购买成功')
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 1000)
      },
      'fail': function (res) {
          app.toast('支付未完成')
      }
    })
  },
});
