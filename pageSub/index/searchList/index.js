const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    searchTxt: '',
    curTabType: 0,
    category_id: 0,
    tabList: [
      { type: 0, name: '新品' },
      { type: 1, name: '销量' },
      { type: 2, name: '价格' },
    ],   // 类别
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
  async onLoad(options) {
    this.setData({
      searchTxt: options.key || '',
      category_id: options.sortid || ''
    }, () => {
      this.getList(true)
    });
  },
  // tab 切换
  tabsChange: app.throttle(function ({ detail }) {
    console.log(detail)
    const current = detail.index
    // if (this.data.curTabType == current + 1) return;

    this.setData({
      curTabType: current
    }, () => {
      this.getList(true)
    })
  }),
  // 输入框改变
  onChange(e) {
    this.setData({
      searchTxt: e.detail.trim(),
    });
  },
  async onSearch() {
    // 清空结果
    this.getList(true)
  },
  async getList(init) {
    const { curTabType, curTab, category_id } = this.data

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
      page_index: curTab.page.page,
      page_size: curTab.page.size,
      "orderbyFile": curTabType,
    }
    if (category_id) {
      data.category_id = category_id
    }

    this.loading = true
    const res = await app.fetch({ url: "GetGoodsList.ashx", data })
    this.loading = false

    curTab.page.page++

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
  goUrl({ currentTarget }) {
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/index/infoDetail/index?item=${item}`,
    })
  },
  // 附近专卖店列表
  goLocationUrl() {
    wx.navigateTo({
      url: '/pageSub/index/locationList/index',
    })
  }
});