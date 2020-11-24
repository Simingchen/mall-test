const app = getApp()
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    status: {
      type: String,
      value: '',
    },
    isEmpty: {
      type: Boolean,
      value: false,
    },
  },
  data: {
  },
  
  methods: {
    async copyWx () {
      wx.setClipboardData({ data: '',
        success: function (res) {
          wx.hideToast();
          wx.showToast({
            title: '微信号已复制成功，请您前往微信【添加好友】页面添加微信',
            icon: 'none'
          })
        } 
      });
    },
  }
})
