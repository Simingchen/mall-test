// components/newsItem/index.js
const app = getApp()
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    list: {
      type: Array,
      value: [],
    }
  },
  data: {
    config: {}
  },
  attached () {
    this.setData({config: app.globalData.config})
  },
  methods: {
    goUrl: app.throttle(function({currentTarget}){  //节流
      const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
      wx.navigateTo({
        url: `/pageSub/index/infoDetail/index?item=${item}`,
      })
    }),
  }
})
