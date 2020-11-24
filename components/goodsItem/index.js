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
    },
    currency: {
      type: String,
      value: '￥',
    },
  },
  data: {
    timeData: {},
  },
  methods: {
    goUrl: app.throttle(function({currentTarget}){  //节流
      const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
      wx.navigateTo({
        url: `/pageSub/index/goodsDetail/index?item=${item}`,
      })
    }),
    
    onChange(e) {
      this.setData({
        timeData: e.detail,
      });
    },
  }
})
