const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: app.globalData.userInfo,
    isShowShare: false,
    isOpend: false,
    shareCode: ''
  },
  onLoad (option) {
    if (option.scene) {
      wx.setStorageSync('scene', option.scene)
    }
  },
  onShow () {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo
    }, () => {
      userInfo.id && this.getData()
    })
  },
  async getData () {
    const detail = await app.fetch({url: "Api/User/userInfo", data: {uid: this.data.userInfo.id}})
    app.globalData.userInfo = detail
    wx.setStorageSync('userInfo', detail)
    this.setData({detail})
  },
  goUrl: app.throttle(function({currentTarget}){  //节流
    const url = currentTarget.dataset.url
    if (!this.data.detail.WxAvatarUrl) {
      if (url.indexOf('login') == -1) {
        app.toast("请先登录")
      }
      
      this.timer = setTimeout(() => {
        wx.navigateTo({url: "/pages/login/index"})
      }, 800)
      return false
    }
    
    wx.navigateTo({ url })
  }),
  onChangeOrder: app.throttle(function({detail}){
    if (detail == 4) {
      wx.navigateTo({
        url: `/pageSub/afterSales/orderList/index?index=${detail}`
      })
      return false
    }
    wx.navigateTo({
      url: `/pageSub/mine/orderList/index?index=${detail}`
    })
  }),
  goUrl: app.throttle(function ({ currentTarget }) {
    //节流
    let url = currentTarget.dataset.url;
    wx.navigateTo({ url });
  }),
  togglePopup () {
    this.setData({isOpend: !this.data.isOpend})
  },
  setPoster() {
    if (!this.data.shareCode) {
      wx.showLoading({
        title: '加载中',
      })
    }
    
    this.setData({
      isOpend: false,
      isShowShare: true
    }, () => {
      // 通过 SelectorQuery 获取 Canvas 节点
      setTimeout(() => {
        this.createSelectorQuery()
        .select('#canvas')
        .fields({
          node: true,
          size: true,
        })
        // .exec(this.init.bind(this))
        .exec(this.setPoster2.bind(this))
      }, 1000)
    })
  },
  async setPoster2(res) {
    // 创建画布
    // const ctx = canvas.getContext('2d')
    const width = res[0].width
    const height = res[0].height

    const canvas = res[0].node
    const ctx = canvas.getContext('2d')

    const dpr = wx.getSystemInfoSync().pixelRatio
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 白色背景
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, 530, 1100)

    let imgUrl = ""
    if (!this.data.shareCode) {
      var code = await app.fetch({
        url: "Api/User/promote",
        data: {uid: this.data.userInfo.id}
      })
      imgUrl = "https://miniapp.lhssbio.com/" + code
      this.setData({
        shareCode: imgUrl
      })
    }
    
    // 下载二维码
    let img2 = canvas.createImage();
    img2.src = imgUrl || this.data.shareCode;

    img2.onload = (res) => {
      ctx.drawImage(img2, 0,  0, 200, 200)

      wx.hideLoading()
      // 保存到相册
      wx.canvasToTempFilePath({
        canvas,
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (res) {
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: '分享码图片已保存到相册',
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        }
      }, this)
    }
  },
  closeShare() {
    this.setData({
      isShowShare: false
    })
    wx.hideLoading()
  },
});