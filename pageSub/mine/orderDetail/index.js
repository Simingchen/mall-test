const app = getApp()
const regeneratorRuntime = app.runtime
import cityList from '../../../static/city.js'

Page({
  data: {
    detail: {},
    express_no: ''
  },
  onLoad (option) {
    if(option.id) {
      this.getData(option.id, option.express_no)
    };
  },

  async getData (id, express_no) {
    wx.showLoading({
      title: '加载中',
    })
    let res = await app.fetch({url: "Api/Order/detail", data: {id} })

    wx.hideLoading()

    res.city = this.filterCity(res.addressInfo.districtid)

    this.setData({
      detail: res,
    }, () => {
      // console.log(this.data.detail)
      this.getExpress(express_no)
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
async getExpress(express_no) {
  // const data = {
  //   order_no: this.data.detail.order_no,
  //   openid: app.globalData.userInfo.openid,
  // }
  // let res = await app.fetch({url: "Api/Express/getOrder", data })

  await app.fetch({url: "Api/Express/getPath", data: {
    order_no: this.data.detail.order_no,
    openid: app.globalData.userInfo.openid,
    express_no
  } }).then(res => {
    const steps = res.path_item_list.map(item =>{
      return {
        text: item.action_type_name + " " + item.action_msg,
        desc: this.formatMoney(item.action_time),
        // inactiveIcon: 'location-o',
        // activeIcon: 'success',
      }
    })
    this.setData({
      steps,
      active: res.path_item_list.length - res.path_item_num
    })
  })
},
formatMoney(date) {
  date = new Date(date * 1000)
  const opt = {
    "Y": date.getFullYear().toString(),        // 年
    "m": (date.getMonth() + 1).toString(),     // 月
    "d": date.getDate().toString(),            // 日
    "H": date.getHours().toString(),           // 时
    "M": date.getMinutes().toString(),         // 分
  };

  return `${opt.Y}-${opt.m}-${opt.d} ${opt.H}:${opt.M}`
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