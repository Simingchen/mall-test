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
  },
  async onLoad(options) {
    this.getList()
  },
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
      uid: app.globalData.userInfo.id
    }
    let par = {}
    this.loading = true
    const res = await app.fetch({
      url: "Api/user/promoterUserList",
      data: {
       ...data,
        ...par
      } 
    })

    curTab.page.page++

    this.loading = false
    console.log(res)

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
  async followUp ({currentTarget}) {
    const item = currentTarget.dataset.item
    const data = {
      "uid": app.globalData.userInfo.id,
      puid: item.id,
    }
    const res = await app.fetch({ url: "Api/user/promoterUserGjList", data })
    console.log(res)
  },
  goUrl ({currentTarget}) {
    const item = currentTarget.dataset.item ? encodeURIComponent(JSON.stringify(currentTarget.dataset.item)) : "{}"

    app.globalData.followUpId = currentTarget.dataset.item.id
    wx.navigateTo({
      url: `/pageSub/salesman/followList/index?item=${item}`,
    })
  },
});