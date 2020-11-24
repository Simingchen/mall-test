const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    mainActiveIndex: 0,
    cartNum: 0,
    items: [],   // 一级分类
    childrenList: [],   // 二级分类

  },
  onShow () {
    this.getTabList()
    this.setData({
      cartNum: app.globalData.cartNum
    })
  },
  async getTabList () {
    const { items } = this.data

    if (!items.length) {
      wx.showLoading({
        title: '加载中',
      })
    }
    const data = {
      "channel_name": "goods",
    }
    const res = await app.fetch({ method: "post", url: `GetCategoryList.ashx`, data })
    const newList = res.map(item => {
      return {
        text: item.title,
        id: item.id
      }
    })

    // 是否全局传值
    let activeIndex = res.findIndex(item => app.globalData.goodsSortId == item.id)
    
    console.log(activeIndex)
    let par = {
      items: newList
    }

    par.mainActiveIndex = activeIndex == -1 ? 0 : activeIndex
    this.setData(par)

    // 获取二级
    await this.getList(par.mainActiveIndex, !activeIndex? app.globalData.goodsSortId : newList[0].id)

    wx.hideLoading()
    // 去除全局ID
    // app.globalData.goodsSortId = 0
  },
  // 获取二级
  getList (index, parent_id) {
    return new Promise(async (resolve, rej) => {
      const data = {
        "channel_name": "goods",
        parent_id
      }
      const res = await app.fetch({ method: "post", url: `GetCategoryList.ashx`, data })
      
      const children = res.map(item => {
        return {
          text: item.title,
          id: item.id
        }
      })
  
      const { items } = this.data
  
      items[index].children = children
      this.setData({
        items,
        childrenList: children 
      })

      resolve(children)
    })
  },
  // 一级切换
  onClickNav({ detail}) {
    this.setData({
      mainActiveIndex: detail.index || 0,
    }, async () => {
      const { items } = this.data
      const res = await this.getList(detail.index, items[detail.index].id)
      
      // 没有子列表，跳转到列表页面
      if (!res.length) {
        wx.navigateTo({
          url: '/pageSub/index/searchList/index?sortid=' + items[detail.index].id,
        })
      }
    });
  },
  // 二级切换
  onClickItem({ detail }) {
    console.log(detail)
    wx.navigateTo({
      url: '/pageSub/index/searchList/index?sortid=' + detail.id,
    })
  },
});