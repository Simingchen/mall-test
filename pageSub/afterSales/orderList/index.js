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
    }
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
      "page_size": curTab.page.size,
      "page_index": curTab.page.page,
    }

    this.loading = true
    const res = await app.fetch({ url: "GetOrderRefundList.ashx", data })

    curTab.page.page++

    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: { ...curTab.page, finished: curTab.page.page >= res.total_page },
      ['curTab.isEmpty']: ![...curTab.list, ...res.list].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.list,
      ['curTab.loadStatus']: (curTab.page.page >= res.total_page) ? 'noMore' : 'loading'
    }, () => {
      console.log(this.data.curTab.list)
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
      url: `/pageSub/afterSales/orderDetail/index?id=${item.id}`,
    })
  },
  // 删除订单
  delete({ currentTarget }) {
    const item = currentTarget.dataset.item
    
    // 删除所选
    wx.showModal({
      title: '提示',
      confirmColor: "#ee0a24",
      content: '确定删除当前订单?',
      success: async (res) => {
        if (res.confirm) {
          const data = {
            "order_no": item.order_no,
          }
          await app.fetch({ url: "CancelOrder.ashx", data })
          this.getList(true);
          app.toast('删除成功')

          // 清空结果
          // this.getData()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
});