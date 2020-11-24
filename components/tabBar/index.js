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
          "pagePath": "pages/index/index",
          "text": "首页"
        },
        {
          "selectedIconPath": "iconweibiaoti35",
          "iconPath": "iconweibiaoti35",
          "pagePath": "pages/goodsSort/index",
          "text": "产品"
        },
        {
          "selectedIconPath": "icontianchongxing-",
          "iconPath": "icontianchongxing-",
          "pagePath": "pages/cart/index",
          "text": "购物车"
        },
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
