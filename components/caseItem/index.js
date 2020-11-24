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

  },
  methods: {
    goUrl: app.throttle(function({currentTarget}){  //节流
      app.getUserState(() => {
        const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
        wx.navigateTo({
          url: `/pageSub/index/caseDetail/index?item=${item}`,
        })
      })
    }),
  }
})
