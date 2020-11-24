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
    type: {
      type: String,
      value: ''
    }
  },
  data: {

  },
  methods: {
    goUrl: app.throttle(function({currentTarget}){  //节流
      let dataset = currentTarget.dataset.item
      dataset.typeStr = this.data.typeStr
      dataset.type = this.data.type
      const item = encodeURIComponent(JSON.stringify(dataset))

      wx.navigateTo({
        url: `/pageSub/card/userCard/index?item=${item}`,
      })
    }),
    goCompany: app.throttle(function({currentTarget}){  //节流
      const item = encodeURIComponent(JSON.stringify(currentTarget.dataset.item))
      wx.navigateTo({
        url: `/pageSub/card/companyCard/index?item=${item}`,
      })
    }),
  }
})
