const app = getApp()
const regeneratorRuntime = app.runtime
    // <!-- 订单状态：1、待付款；2、待发货；3、待收货；4、已完成；5、已退款； -->
Page({
  data: {
    searchTxt: '',
    curTabType: 0,
    tabList: [{
        type: 1,
        name: '待付款'
      },
      {
        type: 2,
        name: '待发货'
      },
      {
        type: 3,
        name: '待收货'
      },
      {
        type: 4,
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
    console.log(options.is_fx)
    this.setData({
      curTabType: parseInt(options.index) || 0,
      is_fx: options.is_fx || ''
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
      this.loading = true

      // 清空数据
      this.setData({
        ['curTab.list']: [],
        ['curTab.page.finished']: false,
        ['curTab.page.page']: 1,
        ['curTab.loadStatus']: 'loading'
      })
    }
    if (curTab.page.finished) return;

    let data = {
      "page_size": curTab.page.size,
      "page": curTab.page.page,
      "uid": app.globalData.userInfo.id || '',
      keyword: '',
      "status": this.data.tabList[curTabType].type,
      is_fx: this.data.is_fx,
    }

    this.loading = true
    app.fetch({
      url: "Api/Order/mylist",
      data
    }).then(res => {
      curTab.page.page++

      console.log(curTab.page.page)
      this.loading = false

      res.data.forEach(item => {
        item.statusStr = ['待付款','待发货','待收货','已完成','已退款'][item.status - 1 ]
      })

      this.setData({
        ['curTab.isLoaded']: true,
        ['curTab.page']: { ...curTab.page, finished: res.data.length < 10 },
        ['curTab.isEmpty']: ![...curTab.list, ...res.data].length,
        ['curTab.list[' + (curTab.page.page - 2) + ']']: res.data,
        ['curTab.loadStatus']: res.data.length < 10 ? 'noMore' : 'loading'
      }, () => {
        console.log(this.data.curTab.page)
      })
    }).catch(err => {
      this.setData({
        ['curTab.isLoaded']: true,
        ['curTab.page']: { ...curTab.page, finished: true },
        ['curTab.list']: [],
        ['curTab.loadStatus']: 'noMore'
      })
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
      if (item.payway == 1) {
        return this.wxPay(item)
      }
  
      this.setData({
        isShowPayPop: true
      })
    })
  },
  async accountPay(password) {
    const par = this.data
    const userInfo = app.globalData.userInfo
    const data = {
      "uid": userInfo.id,
      fee: par.curOrder.total_price,
      order_no: par.curOrder.order_no,
      password
    }
    await app.fetch({url: "Api/Wallet/wallet_pay", data }).then(() => {
      app.toast('支付成功')
      this.getList(true)
      // setTimeout(() => {
      //   wx.redirectTo({
      //     url: '/pageSub/mine/orderList/index?index=1',
      //   })
      // }, 1000)
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
    const userInfo = app.globalData.userInfo
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
        app.toast('支付成功')
        this.getLit(true)
      },
      'fail': function (res) {
        // app.toast('支付未完成')
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
            id: item.id,
          }
          await app.fetch({ url: "Api/Order/order_cancel", data })
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