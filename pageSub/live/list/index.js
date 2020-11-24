const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    curTabType: 0,
    tabList: [
      { name: '直播',
      isLoaded: false,
      loadStatus: "loading",   // 加载状态
      isEmpty: false,   // 是否空白数据
      page: {   // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: [] },
      { name: '回放',
      isLoaded: false,
      loadStatus: "loading",   // 加载状态
      isEmpty: false,   // 是否空白数据
      page: {   // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: [] },
    ],
  },
  async onLoad (options) {
    this.getList(true)
  },
  // tab 切换
  tabsChange: app.throttle(function ({ detail }) {
    const current = detail.index || 0
    console.log(current)
    this.setData({
      curTabType: current
    }, () => {
      this.getList()
    })
  }),
  // 获取直播列表
  async getList (init) {
    const { curTabType, tabList } = this.data
    
    const curTab = tabList[curTabType]
    // 初始化
    if (init) {
      curTab.page.page = 1;
      curTab.list = [];
      curTab.page.finished = false
      curTab.loadStatus = 'loading'
      this.loading = false

      // 清空数据
      this.setData({
        tabList
      })
    }
    if (this.loading || curTab.page.finished) return;


    let data = {
      page_index: curTab.page.page,
      page_size: curTab.page.size,
    }

    this.loading = true
    // 直播间状态。101：直播中，102：未开始，103已结束，104禁播，105：暂停，106：异常，107：已过期
    const res = await app.fetch({ url: "GetLiveRoomList.ashx",data });
   
    res.list.room_info = res.list.room_info.filter(item => {
      return item.live_status == 101 || item.live_status == 102 || item.live_status == 103
    })
    // console.log(res)
    // const liveList = [...res.list.room_info, ...res.list.live_replay]
    this.loading = false

    curTab.page.page ++
    
    curTab.isLoaded = true
    curTab.page = {...curTab.page, finished: curTab.page.page >= res.list.total}
    curTab.isEmpty =![...curTab.list, ...res.list.room_info].length 
    curTab.list[curTab.page.page - 2] = res.list.room_info 
    curTab.loadStatus = (curTab.page.page >= res.list.total)? 'noMore' : 'loading'

    console.log(tabList)

    this.setData({
      tabList
    })
    
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },
  //刷新
  onPullDownRefresh(){
    
    this.getList(true);
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  // 跳转直播
  goLiveDetail: app.throttle(function ({ currentTarget }) {
    //节流
    let item = currentTarget.dataset.item;
    // let roomId = [直播房间id] // 填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
    let customParams = encodeURIComponent(JSON.stringify({ path: 'pages/index/index', pid: 1 })) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
    wx.navigateTo({
        url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${item.roomid}&custom_params=${customParams}`
    })
  }),
});