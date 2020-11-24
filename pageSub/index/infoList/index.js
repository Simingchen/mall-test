const app = getApp()
const regeneratorRuntime = app.runtime
import moment from '../../../utils/moment'

Page({
  data: {
    searchTxt: '',
    curTabType: 1,
    classList: [],   // 类别
    keyList: [],     // 关键词
    timeList: [      // 时间
      {Name: '不限', time: '0' },
      {Name: '一个月内', time: '1' },
      {Name: '3个月内', time: '3' },
      {Name: '半年内', time: '6' },
      {Name: '一年内', time: '12' },
    ],     
    curClass: "",
    curKey: "",
    curTime: "",
    NewsTimeStart: '',
    NewsTimeEnd: '',
    tabList: [{},{},{}],
    isOpend: false,
  },
  async onLoad (options) {
    this.setData({
      searchTxt: options.key || '',
      curKey: ''
    }, () => {
      this.getData()
    });
    const bannerList = await app.getBanner(4)
    this.setData({ bannerList })

    this.getClass(1)
    this.getClass(7)
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
      {title: "项目信息", type: 3},
    ]
    const tabList = initList.map((item) => {
      return {
        ...item,
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
    })
    this.setData({ tabList })
  },
  // 获取分类
  async getClass (Type) {
    // 资讯 = 1,
    // 服务商库 = 2,
    // 金融圈分类 = 3,
    // 搜索类型 = 4,
    // 消息 = 5,
    // 系统关键字 = 6,
    // 资讯关键字 = 7,
    if (!Type) return;
    const list = await app.fetch({url: "api/C/Anonymous/Class/GetListByType", data: { Type }})
    if (Type == 1) {
      this.setData({ classList: list })
    }
    if (Type == 7) {
      this.setData({ keyList: list })
    }
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
  // 改变筛选
  changeFilter({currentTarget}) {
    const dataset = currentTarget.dataset
    const temp = {
      isOpend: false,
      [`cur${dataset.type}`]: dataset.id,
    }
    if (dataset.type == 'Key') {
      temp.searchTxt = dataset.id
    }

    this.setData(temp, () => {
      // 清空结果
      setTimeout(() => {
        this.getData()
      }, 300)
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
      this.loading = false
    }
    if (this.loading || curTabItem.page.finished) return;

    curTabItem.page.page ++

    let par = this.data

    let data = {
      NewsType: curTabType,
      // NewsTimeStart: par.NewsTimeStart,
      // NewsTimeEnd: par.NewsTimeEnd,
      // ClassId: par.curClass,
      // Keywords: par.searchTxt,
      Page: curTabItem.page.page,
      PageSize: curTabItem.page.size,
    }

    // 计算时间
    let NewsTimeStart = ''
    let NewsTimeEnd = ''
    if (par.curTime != 0) {
      NewsTimeStart = moment().subtract(par.curTime, 'months').format('YYYY-MM-DD');
      NewsTimeEnd = moment().format('YYYY-MM-DD');

      data.NewsTimeStart = NewsTimeStart
      data.NewsTimeEnd = NewsTimeEnd
    }

    if (par.curKey.length) { par.searchTxt = par.curKey }
    if (!!par.searchTxt.length) {data.Keywords = par.searchTxt }
    if (par.curClass) {data.ClassId = par.curClass }
    

    this.loading = true
    const res = await app.fetch({url: "api/C/Anonymous/news/GetList", data })
    this.loading = false

    const curTab = `tabList[${par.curTabType-1}]`
    this.setData({
      [curTab + '.isLoaded']: true,
      [curTab + '.page']: {...curTabItem.page, finished: !res.HasNextPage},
      [curTab + '.isEmpty']: ![...curTabItem.list, ...res.Items ].length,
      [curTab + '.list[' + (curTabItem.page.page - 1) + ']']: res.Items,
      [curTab + '.loadStatus']: res.HasNextPage? 'loading' : 'noMore',
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  openFilter() {
    this.setData({isOpend: true})
  },
  closeFilter() {
    this.setData({isOpend: false})
  },
  goUrl ({currentTarget}) {
    const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
    wx.navigateTo({
      url: `/pageSub/index/infoDetail/index?item=${item}`,
    })
  },
  resetFilter () {
    this.setData({
      curTime: '',
      curClass: '',
      curKey: '',
      searchTxt: '',
      isOpend: false
    }, () => {
      this.getData()
    })
  },
  showCopyright () {
    wx.showModal({
      title: '声明提示',
      content: `1. 融创平台转载、编辑、摘编的所有作品，目的在于信息传递，并不代表本平台赞同其观点和对其真实性负责。如有版权问题，请及时联系我们作删除处理，融创平台仅作发布分享学习使用。\n2. 原创的所有作品，其版权属于融创平台所有，其他媒体、网络或个人转载使用时请注明：“文章来源：融创平台”。`,
      showCancel: false,
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
});