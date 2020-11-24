const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    list: [],
    curTab: {
      isLoaded: false,
      loadStatus: "loading",   // 加载状态
      page: {   // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: []
    },
  },
  onShow () {
    this.getList(true)
  },
  async getList (init) {
    const { curTab } = this.data
    
    const curTabItem = curTab
    // 初始化
    if (init) {
      curTabItem.page.page = 1;
      curTabItem.list = [];
      curTabItem.page.finished = false;
      this.loading = false
    }
    if (this.loading || curTabItem.page.finished) return;


    let data = {
      "page_size":"10",
      "page_index": curTabItem.page.page
    }
    
    this.loading = true
    const res = await app.fetch({method: 'post', url: "GetUserCollectionGoodsList.ashx", data })
    this.loading = false

    curTabItem.page.page ++

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.isEmpty']: ![...curTabItem.list, ...res.list ].length,
      ['curTab.page']: {...curTabItem.page, finished: curTabItem.page.page >= res.total_page},
      ['curTab.list']: [...curTabItem.list, ...res.list ],
      ['curTab.loadStatus']: (curTabItem.page.page >= res.total_page)? 'noMore' : 'loading',
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
      url: `/pageSub/index/goodsDetail/index?item=${item}`,
    })
  },
  async delete ({currentTarget}) {
    const item = currentTarget.dataset.item
    const data = {
      goods_id: item.goods_id
    }

    let res = await app.fetch({url: "SaveUserCollectionGoods.ashx", data })

    this.getList(true);
    app.toast('删除成功')
  },

});