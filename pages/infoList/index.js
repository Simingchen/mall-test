const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    searchTxt: '',
    isOpend: false,
    curTab: {
      isLoaded: false,
        loadStatus: "loading",   // 加载状态
        isEmpty: false,   // 是否空白数据
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
  },
  getData () {
    // 清空结果
    this.initResult()
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.getList(true)
    }, 50)
  },
  initResult () {
    let initList = [
      {title: "信息汇聚", type: 1},
      {title: "专家视野", type: 2},
      {title: "招投标", type: 3},
    ]
    const tabList = initList.map((item) => {
      return {
        ...item,
        
      }
    })
    this.setData({ tabList })
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
    if (this.loading || curTabItem.page.finished) return;

    curTabItem.page.page ++

    let par = this.data

    let data = {
      keyword: par.searchTxt,
      Page: curTabItem.page.page,
      PageSize: curTabItem.page.size,
    }

    // if (!!par.searchTxt.length) {data.Keywords = par.searchTxt }
    

    this.loading = true
    const res = await app.fetch({url: "Api/Article/alist", data })
    this.loading = false

    const curTab = `curTab`
    this.setData({
      [curTab + '.isLoaded']: true,
      [curTab + '.page']: {...curTabItem.page, finished: curTabItem.page.page >= res.page},
      [curTab + '.isEmpty']: ![...curTabItem.list, ...res.data ].length,
      [curTab + '.list[' + (curTabItem.page.page - 1) + ']']: res.data,
      [curTab + '.loadStatus']: (curTabItem.page.page >= res.page) ? 'noMore' : 'loading'
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  goUrl: app.throttle(function ({currentTarget}) {
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/index/infoDetail/index?item=${item}`,
    })
  }, 100),
  filterTime: function (date) {
    date = new Date(date)
    console.log(date)
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  },
});