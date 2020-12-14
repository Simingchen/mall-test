const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    searchTxt: '',
    curTabType: 1,
    tabList: [{},{}],
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
  async onLoad () {
    this.getData()
  },
  getData () {
    // 清空结果
    this.initResult(() => {
      this.getList(true)
    })
  },
  initResult (callback) {
    let initList = [
      {title: "全部", type: 0, api: 'Api/Huodong/huodong_list'},
      {title: "我的", type: 1, api: 'Api/Huodong/huodong_list'},
    ]
    const tabList = initList.map((item) => {
      return {
        ...item,
        isLoaded: false,
        loadStatus: "loading",   // 加载状态
        loading: false,
        page: {   // 页码
          page: 0,
          size: 10,
          finished: false
        },
        list: []
      }
    })
    this.setData({ tabList }, () => {
      callback && callback()
    })
  },
  // tab 切换
  tabsChange({detail}) {
    const current = detail.index
    if (this.data.curTabType == current + 1) return;

    this.setData({
      curTabType: current + 1
    }, () => {
      const { tabList } = this.data
      // 切换的时候判定没有加载过情况下拉数据
      if (!tabList[current].isLoaded) {
        this.getList(true)
      }
    })
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
    const {curTabType, tabList } = this.data
    const curTabItem = tabList[curTabType - 1]
    // 初始化
    if (init) {
      curTabItem.page.page = 0;
      curTabItem.list = [];
      curTabItem.page.finished = false
    }
    if (curTabItem.loading || curTabItem.page.finished) return;

    curTabItem.page.page ++

    let par = this.data

    const userInfo = wx.getStorageSync('userInfo') || {}
    let data = {
      page: curTabItem.page.page,
      openid: userInfo.openid,
      is_zj: curTabType == 2 ? 1: 0
    }

    const curTab = `tabList[${par.curTabType-1}]`

    this.setData({
      [curTab + '.loading']: true
    })
    const res = await app.fetch({url: curTabItem.api, data })

    console.log(res)

    this.setData({
      [curTab + '.isLoaded']: true,
      [curTab + '.loading']: false,
      [curTab + '.page']: {...curTabItem.page, finished: curTabItem.page.page >= res.page},
      [curTab + '.isEmpty']: ![...curTabItem.list, ...res.data ].length,
      [curTab + '.list[' + (curTabItem.page.page - 1) + ']']: res.data,
      [curTab + '.loadStatus']: (curTabItem.page.page >= res.page) ? 'noMore' : 'loading'
    }, () => {
      console.log(this.data.tabList)
    })
  },
  async getList1 (init) {
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

    const userInfo = wx.getStorageSync('userInfo') || {}
    let data = {
      page: curTabItem.page.page,
      openid: userInfo.openid,
    }

    this.loading = true
    const res = await app.fetch({url: "Api/Huodong/huodong_list", data })
    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.loading']: false,
      ['curTab.page']: {...curTabItem.page, finished: curTabItem.page.page >= res.page},
      ['curTab.isEmpty']: ![...curTabItem.list, ...res.data ].length,
      ['curTab.list[' + (curTabItem.page.page - 1) + ']']: res.data,
      ['curTab.loadStatus']: (curTabItem.page.page >= res.page) ? 'noMore' : 'loading'
    }, () => {
      console.log(this.data.curTab)
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