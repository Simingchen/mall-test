const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    searchTxt: '',
    curTabType: 0,
    tabList: [{
        type: 0,
        name: '待付款'
      },
      {
        type: 1,
        name: '待发货'
      },
      {
        type: 2,
        name: '待收货'
      },
      {
        type: 3,
        name: '已完成'
      },
    ], // 类别
    curTab: {
      isLoaded: false,
      loadStatus: "loading", // 加载状态
      isEmpty: false, // 是否空白数据
      page: { // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: []
    }
  },
  async onLoad(options) {
    console.log(options.index)
    this.setData({
      curTabType: parseInt(options.index) || 0,
    }, () => {
      this.getList(true)
    });
  },
  // tab 切换
  tabsChange: app.throttle(function ({
    detail
  }) {
    const current = detail.index
    this.setData({
      curTabType: current
    }, () => {
      this.getList(true)
    })
  }),
  async getList(init) {
    const {
      curTabType,
      curTab
    } = this.data

    // 初始化
    if (init) {
      curTab.page.page = 1;
      curTab.list = [];
      curTab.page.finished = false
      this.loading = false

      // 清空数据
      this.setData({
        'curTab.list': []
      })
    }
    if (this.loading || curTab.page.finished) return;

    let data = {
      "page_size": curTab.page.size,
      "page_index": curTab.page.page,
      // "status": curTabType,
      // "payment_status": "0",
      // "express_status": "0"
    }
    let par = {}
    // 待付款
    if (curTabType == 0) {
      par = {
        status: 1,
        payment_status:1,
        express_status:0
      }
    }
    // 待发货
    if (curTabType == 1) {
      par = {
        status:0,
        payment_status:0,
        express_status:1,
      }
    }
    // 待收货
    if (curTabType == 2) {
      par = {
        status:0,
        payment_status:0,
        express_status:2,
      }
    }
    // 已完成
    if (curTabType == 3) {
      par = {
        status:3,
        payment_status:0,
        express_status:0,
      }
    }

    this.loading = true
    const res = await app.fetch({
      url: "GetUserOrderList.ashx",
      data: {
       ...data,
        ...par
      } 
    })

    curTab.page.page++

    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: { ...curTab.page, finished: curTab.page.page >= res.total_page },
      ['curTab.isEmpty']: ![...curTab.list, ...res.list].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.list,
      ['curTab.loadStatus']: (curTab.page.page >= res.total_page) ? 'noMore' : 'loading'
    }, () => {
      console.log(this.data.curTab)
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  // 跳转到详情
  goDetail({ currentTarget }) {
    const item = currentTarget.dataset.item
    wx.navigateTo({
      url: `/pageSub/mine/orderDetail/index?id=${item.id}`,
    })
  },
  // 支付
  async pay({ currentTarget }) {
    const item = currentTarget.dataset.item
    const par = {
      "pay_order_no": item.order_no,
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
        this.getList(true);
      },
      'fail': function (res) {
      }
    })
  },
  // 取消订单
  cancel({ currentTarget }) {
    const item = currentTarget.dataset.item
    
    // 删除所选
    wx.showModal({
      title: '提示',
      confirmColor: "#ee0a24",
      content: '确定取消当前订单?',
      success: async (res) => {
        if (res.confirm) {
          const data = {
            "order_no": item.order_no,
          }
          await app.fetch({ url: "CancelOrder.ashx", data })
          this.getList(true);
          app.toast('取消成功')

          // 清空结果
          // this.getData()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
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
  // 复制订单号
  copy({ currentTarget }) {
    const item = currentTarget.dataset.item
    wx.setClipboardData({
      data: item.order_no,
      success: function(res) {
          console.log("订单号复制成功")
      }
    })
  }
});