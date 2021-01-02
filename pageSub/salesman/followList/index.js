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
      list: [],
    },
    puid: 0,
  },
  onShow() {

    this.setData({
      puid: app.globalData.followUpId || 3
    }, () => {
      this.getList(true)
    });
  },
  async getList(init) {
    const {
      curTabType,
      curTab
    } = this.data

    // 初始化
    if (init) {
      curTab.page.page = 1;
      this.loading = false

      // 清空数据
      this.setData({
        ['curTab.list']: [],
        ['curTab.page']: { page: 1, finished: false }
      })
    }
    if (this.loading || curTab.page.finished) return;

    this.loading = true
    const data = {
      "uid": app.globalData.userInfo.id,
      puid: this.data.puid,
    }
    const res = await app.fetch({ url: "Api/user/promoterUserGjList", data })

    curTab.page.page++

    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      // ['curTab.page']: { ...curTab.page, finished: curTab.page.page >= res.total_page },
      ['curTab.isEmpty']: ![...curTab.list, ...res].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res,
      ['curTab.loadStatus']: 'noMore'
      // ['curTab.isLoaded']: true,
      // ['curTab.page']: { ...curTab.page, finished: res.data.length < 10 },
      // ['curTab.isEmpty']: ![...curTab.list, ...res.data].length,
      // ['curTab.list[' + (curTab.page.page - 2) + ']']: res.data,
      // ['curTab.loadStatus']: res.data.length < 10 ? 'noMore' : 'loading'
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  goUrl ({currentTarget}) {
    let temp = {
      puid: this.data.puid
    }
    const item = currentTarget.dataset.item 
    const par = item ? {...item, ...temp } : temp

    wx.navigateTo({
      url: `/pageSub/salesman/followEdit/index?item=${encodeURIComponent(JSON.stringify(par))}`,
    })
  },
});