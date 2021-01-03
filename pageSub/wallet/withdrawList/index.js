const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    curTabType: 0,
       // 类别
    curTab: {
      isLoaded: false,
      loadStatus: "loading",   // 加载状态
      isEmpty: false,   // 是否空白数据
      page: {   // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: []
    }
  },
  async onLoad (options) {
    this.setData({
      searchTxt: options.key || '',
      curKey: ''
    }, () => {
      this.getList(true)
    });
  },
  // tab 切换
  tabsChange: app.throttle(function({detail}) {
    console.log(detail)
    const current = detail.index
    if (this.data.curTabType == current + 1) return;

    this.setData({
      curTabType: current
    }, () => {
      const { curTab } = this.data
      // 切换的时候判定没有加载过情况下拉数据
      if (!curTab.isLoaded) {
        this.getList(true)
      }
    })
  }),
  async getList (init) {
    const {curTab } = this.data
    
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
      uid: app.globalData.userInfo.id,
      page: curTab.page.page,
    }

    this.loading = true
    const res = await app.fetch({method: "post", url: "Api/Wallet/cashOutList", data })
    this.loading = false

    res.data.forEach(item=> {
      try {
        item.card = '····    ····    ···· ' + item.card.slice(-4)
      } catch (err) {}

      item.fee = Math.floor(item.money) * 6 / 1000
    })

    console.log(res)

    curTab.page.page ++

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: {...curTab.page, finished: res.data.length < 10},
      ['curTab.isEmpty']: ![...curTab.list, ...res.data].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.data,
      ['curTab.loadStatus']: (res.data.length < 10)? 'noMore' : 'loading'
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  goUrl: app.throttle(function({currentTarget}){  //节流
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    console.log(currentTarget.dataset.item)
    wx.navigateTo({
      url: `/pageSub/index/goodsDetail/index?item=${item}`,
    })
  }),
});