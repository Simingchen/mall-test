const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");
import cityList from '../../../static/city.js'

Page({
  data: {
    detail: {},
    expressdetail: ''
  },
  onLoad (option) {
    if(option.id) {
      this.getData(option.id)
    };
  },

  async getData (id) {
    wx.showLoading({
      title: '加载中',
    })
    let res = await app.fetch({url: "Api/Order/detail", data: {id} })

    wx.hideLoading()
    if (res.expressdetail) {
      wxparse.wxParse('content', 'html', res.expressdetail, this, 5)
    }

    res.city = this.filterCity(res.addressInfo.districtid)

    this.setData({
      detail: res,
      expressdetail: res.expressdetail
    }, () => {
      console.log(this.data.detail)
    })
  },
  dateFormat(fmt, date) {
    let ret;
    date = new Date(date)
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
},
filterCity (code) {
  if (!code) {
    return ''
  }
  const province = cityList.province_list[code.slice(0,2) + '0000']
  const city = cityList.city_list[code.slice(0,4) + '00']
  const county = cityList.county_list[code]
  return `${province} ${city} ${county}`
},
  // 确认收货
  confirmIt() {
    // order_no
    wx.showModal({
      title: '提示',
      content: ' 是否确认收货',
      success: async(res) =>{
        if (res.confirm) {
          console.log('用户点击确定')
          let res = await app.fetch({url: "ConfirmTrade.ashx", data: {order_no: this.data.detail.order_no} })
          app.$toast('确认收货成功')
          this.getData()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 支付
  async pay() {
    const par = {
      "pay_order_no": this.data.detail.order_no,
	    "pay_order_amount":"1"
    }
    console.log(par)
    const respay = await app.fetch({url: "api/payment/wxapipay/index.ashx", data: par })
    // 触发微信支付
    wx.requestPayment({
      'timeStamp': respay.timeStamp,
      'nonceStr': respay.nonceStr,
      'package': respay.package,
      'signType': 'MD5',
      'paySign': respay.paySign,
      'success': (res) => {
        app.toast('支付成功')
        this.getData();
      },
      'fail': function (res) {
      }
    })
  },
  copy() {
    wx.setClipboardData({
      data: this.data.detail.order_no,
      success: function(res) {
          console.log("复制成功")
      }
    })
  },
  // 退款
  refund({ currentTarget }) {
    let temp = {
      ...currentTarget.dataset.item,
      order_no: currentTarget.dataset.order.order_no
    }
    const item = encodeURIComponent(JSON.stringify(temp))
    wx.navigateTo({
      url: `/pageSub/afterSales/orderSubmit/index?item=${item}`,
    })
  },
});