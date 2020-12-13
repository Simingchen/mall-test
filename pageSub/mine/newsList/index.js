const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    curTabType: 1,
    tabList: [{},{}],
    isOpend: false,
  },
  async onLoad () {
    this.getData()
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
      {title: "公告", type: 0, api: 'Api/About/gonggao_list'},
      {title: "帮助", type: 1, api: 'Api/About/bangzhu_list'},
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
    this.setData({ tabList })
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

    let data = {
      "page": curTabItem.page.page,
      // PageSize: curTabItem.page.size,
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
  // 上拉加载
  onReachBottom() {
    this.getList();
  }
});