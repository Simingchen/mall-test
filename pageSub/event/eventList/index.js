const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    searchTxt: '',
    curTab: {
      isLoaded: false,
      loadStatus: "loading",   // 加载状态
      page: {   // 页码
        page: 0,
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
      this.getData()
    });

    // const bannerList = await app.getBanner(5)
    // this.setData({ bannerList })
  },
  getData () {
    // 清空结果
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.getList(true)
    }, 50)
  },
  // 输入框改变
  onChange(e) {
    this.setData({
      searchTxt: e.detail.trim(),
      curKey: ''
    });
  },
  async onSearch() {
    // 清空结果
    this.getData()
  },
  async getList (init) {
    const curTabItem = this.data.curTab
    // 初始化
    if (init) {
      curTabItem.page.page = 0;
      curTabItem.list = [];
      curTabItem.page.finished = false
      this.loading = false
    }
    if (curTabItem.page.finished) return;

    curTabItem.page.page ++

    let par = this.data

    let data = {
      MettingType: curTabItem.type,
      Page: curTabItem.page.page,
      PageSize: curTabItem.page.size,
    }


    if (par.curKey.length) { par.searchTxt = par.curKey }
    if (!!par.searchTxt.length) {data.Keywords = par.searchTxt }
    

    this.loading = true
    const res = await app.fetch({url: "api/C/Anonymous/Meeting/GetList", data })
    this.loading = false

    const curTab = `tabList[${par.curTabType-1}]`
    this.setData({
      [curTab + '.isLoaded']: true,
      [curTab + '.page']: {...curTabItem.page, finished: !res.HasNextPage},
      // [curTab + '.list']: [...curTabItem.list, ...res.Items ],
      [curTab + '.isEmpty']: ![...curTabItem.list, ...res.Items ].length,
      [curTab + '.list[' + (curTabItem.page.page - 1) + ']']: res.Items,
      [curTab + '.loadStatus']: res.HasNextPage? 'loading' : 'noMore',
    }, () => {
      // console.log(this.data.tabList)
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  goUrl ({currentTarget}) {
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/index/infoDetail/index?item=${item}`,
    })
  },
});