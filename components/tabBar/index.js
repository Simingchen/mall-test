const app = getApp()
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    selected: {
      type: String,
      value: '',
    },
    cartNum: {
      type: String,
      value: '',
    },
    // isLogin: {
    //   type: Boolean,
    //   value: false,
    // },
  },
  data: {
    isLogin: false,
    cartNum1: 2,
    "tabBar": {
      "color": "#333333FF",
      "backgroundColor": "#fff",
      "selectedColor": "#FB560AFF",
      "list": [
        {
          "selectedIconPath": "iconshouye",
          "iconPath": "iconshouye",
          "pagePath": "pages/show/index",
          "text": "宫颜之禧"
        },
        {
          "selectedIconPath": "icongoods-copy",
          "iconPath": "icongoods-copy",
          "pagePath": "pages/index/index",
          "text": "美丽商城"
        },
        {
          "selectedIconPath": "iconweibiaoti35",
          "iconPath": "iconweibiaoti35",
          "pagePath": "pages/infoList/index",
          "text": "美丽资讯"
        },
        // {
        //   "selectedIconPath": "icontianchongxing-",
        //   "iconPath": "icontianchongxing-",
        //   "pagePath": "pages/cart/index",
        //   "text": "美丽播"
        // },
        {
          "selectedIconPath": "iconwode",
          "iconPath": "iconwode",
          "pagePath": "pages/mine/index",
          "text": "我的"
        }
      ]
    },
  },
  // lifetimes: {
  //   ready: function() {
  //     this.setData({
  //       cartNum1: app.globalData.cartNum
  //     })
  //   },
  // },
  // observers: {
  //   'cartNum': function (val) {
  //     if(!val) return;
  //     this.setData({
  //       cartNum1: val
  //     })
  //   }
  // },
  methods: {
    goUrl: app.throttle(function({currentTarget}){  //节流
      let index = currentTarget.dataset.index
      const { selected, tabBar } = this.data
      if (index == selected) return;

      wx.switchTab({
        url: `/${tabBar.list[index].pagePath}`,
      })
    }),
  }
})
