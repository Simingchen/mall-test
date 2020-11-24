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

    

    let par = this.data

    let data = {
      page_index: curTab.page.page,
      page_size: curTab.page.size,
    }

    this.loading = true
    const res = await app.fetch({method: "post", url: "GetWxTransfersList.ashx", data })
    this.loading = false

    curTab.page.page ++

    res.list.forEach(item => {
      item.add_time = this.dateFormat("YYYY-mm-dd HH:MM:SS", item.add_time)
    })

    console.log(res.list)
    
    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: {...curTab.page, finished: curTab.page.page >= res.total_page},
      ['curTab.isEmpty']: ![...curTab.list, ...res.list].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.list,
      ['curTab.loadStatus']: (curTab.page.page >= res.total_page)? 'noMore' : 'loading'
    }, () => {
      console.log(this.data.curTab)
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
  // 格式化时间
  dateFormat(fmt, date) {
    let ret;
    date = new Date(date)
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
},
});