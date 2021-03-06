const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
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
    isShowPop: false,
    orderNo: ""
  },
  async onLoad(options) {
    this.getList(true)
  },
  async getList(init) {
    const { curTab } = this.data

    // 初始化
    if (init) {
      curTab.page.page = 1;
      curTab.list = [];
      curTab.page.finished = false
      this.loading = false

      // 清空数据
      this.setData({
        ['curTab.list']: []
      })
    }
    if (this.loading || curTab.page.finished) return;

    let data = {
      uid: app.globalData.userInfo.id,
      "page": curTab.page.page,
    }

    this.loading = true
    const res = await app.fetch({ url: "Api/order/postsaleList", data })

    curTab.page.page++

    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: { ...curTab.page, finished: res.data.length < 10 },
      ['curTab.isEmpty']: ![...curTab.list, ...res.data].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.data,
      ['curTab.loadStatus']: res.data.length < 10 ? 'noMore' : 'loading'
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  // 跳转到详情
  goDetail({ currentTarget }) {
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/afterSales/orderDetail/index?item=${item}`,
    })
  },
  // 输入框更改
  onChangeInput({currentTarget, detail}) {
    const string = detail.trim()
    this.setData({
      [currentTarget.dataset.type]: string
    })
  },
  // 填写退货快递号
  returnGoods({ currentTarget }) {
    const item = currentTarget.dataset.item
    this.setData({
      isShowPop: true,
      curItem: item
    })
  },
  onClose() {
    this.setData({
      isShowPop: false,
      orderNo: ""
    })
  },
  comfirmReturn() {
    if (!this.data.orderNo.length) {
      return app.toast("请输入快递单号")
    }
    if (this.data.orderNo.length < 6) {
      return app.toast("快递单号长度不用低于6位")
    }

    const data = {
      postsale_id: this.data.curItem.postsaleInfo.id,
      express_no: this.data.orderNo
    }
    app.fetch({ url: "Api/order/expressSub", data }).then(res => {
      this.onClose()
      app.toast("提交成功，请留意平台信息")
    })
  }
});