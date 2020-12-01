const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    list: [],
    caseTab: {
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
    const { caseTab } = this.data
    
    const curTabItem = caseTab
    // 初始化
    if (init) {
      curTabItem.page.page = 0;
      curTabItem.list = [];
      curTabItem.page.finished = false;
      this.loading = false
      // 清空数据
      this.setData({
        'caseTab.list': []
      })
    }
    if (this.loading || curTabItem.page.finished) return;

    curTabItem.page.page ++

    let data = {
      "uid": app.globalData.unionid,
    }
    
    this.loading = true
    const res = await app.fetch({url: "Api/Address/address_list", data })
    this.loading = false

    this.setData({
      ['caseTab.isLoaded']: true,
      ['caseTab.page']: {...curTabItem.page, finished: !res.list.length},
      ['caseTab.list']: [...curTabItem.list, ...res.list ],
      ['caseTab.loadStatus']: res.list.length? 'loading' : 'noMore',
    }, () => {
      console.log(this.data.caseTab)
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  goUrl ({currentTarget}) {
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/mine/addressEdit/index?item=${item}`,
    })
  }
});