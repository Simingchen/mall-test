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
    },
    isShowPayPop: false,
    payPassword: ''
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
      "uid": app.globalData.userInfo.id || '',
      keyword: '',
      "status": curTabType,
      is_fx: 0,
    }

    this.loading = true
    const res = await app.fetch({
      url: "Api/Order/mylist",
      data
    })

    curTab.page.page++

    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: { ...curTab.page, finished: res.data.length < 10 },
      ['curTab.isEmpty']: ![...curTab.list, ...res].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.data,
      ['curTab.loadStatus']: res.data.length < 10 ? 'noMore' : 'loading'
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

    this.setData({
      curOrder: item
    }, () => {
      if (item.way == 1) {
        return this.wxPay(item)
      }
  
      this.setData({
        isShowPayPop: true
      })
    })
  },
  async accountPay(password) {
    const par = this.data
    const userInfo = wx.getStorageSync('userInfo') || {}
    const data = {
      "uid": userInfo.id,
      fee: par.curOrder.total_price,
      order_no: par.curOrder.order_no,
      password
    }
    await app.fetch({url: "Api/Wallet/wallet_pay", data }).then(() => {
      app.toast('支付成功')

      setTimeout(() => {
        wx.redirectTo({
          url: '/pageSub/mine/orderList/index?index=1',
        })
      }, 1000)
    }).catch((err) => {
      console.log(err)
      this.onClosePop()
      // setTimeout(() => {
      //   wx.redirectTo({
      //     url: '/pageSub/mine/orderList/index?index=0',
      //   })
      // }, 1000)
    })

    
  },
  async wxPay (item) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const par = {
      fee: item.total_price,
      openid: userInfo.openid,
      "out_trade_no": item.order_no,
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
  },
  // 关闭支付密码
  onClosePop() {
    this.setData({
      isShowPayPop: false,
      payPassword: ''
    })
  },
  // 输入框更改
 onChangeInput({currentTarget, detail}) {
  const string = detail.trim()
 this.setData({
   [currentTarget.dataset.type]: string
 }, () => {
   if (currentTarget.dataset.type == "payPassword") {
     if (string.length > 5) {
       this.accountPay(string)
     }
   }
 })
},
});