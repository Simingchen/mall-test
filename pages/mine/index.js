const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    detail: app.globalData.userInfo,
    isShowShare: false,
    isOpend: false,
  },
  onLoad (option) {
    if (option.scene) {
      wx.setStorageSync('scene', option.scene)
    }
  },
  onShow () {
    // this.getData()
    this.setData({
      userInfo: wx.getStorageSync('userInfo') || {}
    })
  },
  async getData () {
    const detail = await app.fetch({method: 'post', url: "Api/Api/addUser"})
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
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      isOpend: false,
      isShowShare: true
    }, () => {
      // 通过 SelectorQuery 获取 Canvas 节点
      this.createSelectorQuery()
        .select('#canvas')
        .fields({
          node: true,
          size: true,
        })
        // .exec(this.init.bind(this))
        .exec(this.setPoster2.bind(this))
    })
  },
  setPoster2(res) {
    console.log(res)
    let that = this;
    
    const globalData = app.globalData

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

    // 主图
    let img1 = canvas.createImage();
    img1.src = '../../static/share.png'

    img1.onload = async (res) => {
      // console.log(res)
      ctx.drawImage(img1, 0, 0, 300, 230)
      const SharePage = globalData.config.SharePage || '/pages/index/index'
      const page = SharePage.slice(0,1) == '/' ? SharePage.slice(1) : SharePage

      const data = {
        // page,
        share_type: '0',
        // width: 500,
        // id: 4
        "channel_id":0,
	      "id": 0
      }
      // 设置字体
      ctx.font = "14px Arial";
      // 设置水平对齐方式
      //  ctx.textAlign = "center";
      // 设置颜色
      ctx.fillStyle = '#333333FF' // 文字颜色：黑色
      let title = that.data.shareTitle
      if (title.length <= 14) {
        // 不用换行
        ctx.fillText(title, 10, 250, 180)
      } else if (title.length <= 28) {
        // 两行
        let firstLine = title.substring(0, 14);
        let secondLine = title.substring(14, 27);
        ctx.fillText(firstLine, 10, 250, 180)
        ctx.fillText(secondLine, 10, 270, 180)
      } else {
        // 超过两行
        let firstLine = title.substring(0, 14);
        let secondLine = title.substring(14, 27) + '...';
        ctx.fillText(firstLine, 10, 250, 180)
        ctx.fillText(secondLine, 10, 270, 180)
      }

      const imgUrl = await app.fetch({
        url: "CreateMiniWxCode.ashx",
        data
      })
      console.log(imgUrl)
      // 下载二维码
      let img2 = canvas.createImage();
      img2.src = imgUrl.qrcode;
      img2.onload = (res) => {
        console.log(res)
        let qrImgSize = 70
        ctx.drawImage(img2, 120,  260, qrImgSize, qrImgSize)

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
                  content: '分享图片已保存到相册,请到朋友圈选择图片发布',
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
    }
  },
  closeShare() {
    this.setData({
      isShowShare: false
    })
    wx.hideLoading()
  },
});