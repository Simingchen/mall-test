const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    list: [],
    curTab: {
      isLoaded: false,
      loadStatus: "loading",   // 加载状态
      page: {   // 页码
        page: 0,
        size: 10,
        finished: false
      },
      list: []
    },
  },
  onShow () {
    this.getList(true)
  },
  async getList (init) {
    const { curTab } = this.data
    
    const curTabItem = curTab
    // 初始化
    if (init) {
      curTabItem.page.page = 0;
      curTabItem.list = [];
      curTabItem.page.finished = false;
      this.loading = false
      // 清空数据
      this.setData({
        'curTab.list': []
      })
    }
    if (this.loading || curTabItem.page.finished) return;

    curTabItem.page.page ++

    let data = {
      "uid": app.globalData.userInfo.id,
    }
    
    this.loading = true
    const res = await app.fetch({url: "Api/Address/address_list", data })
    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: {...curTabItem.page, finished: true},
      ['curTab.list']: [...curTabItem.list, ...(res || []) ],
      ['curTab.loadStatus']: 'noMore',
    }, () => {
      console.log(this.data.curTab)
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  goUrl ({currentTarget}) {
    const item = currentTarget.dataset.item ? encodeURIComponent(JSON.stringify(currentTarget.dataset.item)) : "{}"
    wx.navigateTo({
      url: `/pageSub/wallet/cardEdit/index?item=${item}`,
    })
  }
});