const app = getApp()
const regeneratorRuntime = app.runtime

Page({
  data: {
    curTab: {
      isLoaded: false,
      loadStatus: "loading", // 加载状态
      isEmpty: false, // 是否空白数据
      page: { // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: [],
    },
    isShowShare: false,
    userInfo: {}
  },
  async onLoad(options) {
    console.log(options.index)
    this.setData({
      curTabType: parseInt(options.index) || 0,
    }, () => {
      this.getList(true)
    });

    this.getData()
  },
  async getData () {
    const userInfo = await app.fetch({url: "Api/User/userInfo", data: {uid: app.globalData.userInfo.id}})
    this.setData({userInfo})
  },
  async getList(init) {
    const {
      curTabType,
      curTab
    } = this.data

    // 初始化
    if (init) {
      curTab.page.page = 1;
      curTab.list = [];
      curTab.page.finished = false
      this.loading = false

      // 清空数据
      this.setData({
        'curTab.list': []
      })
    }
    if (this.loading || curTab.page.finished) return;

    let data = {
      uid: app.globalData.userInfo.id
    }
    let par = {}
    this.loading = true
    const res = await app.fetch({
      url: "Api/user/promoterUserList",
      data: {
       ...data,
        ...par
      } 
    })

    curTab.page.page++

    this.loading = false

    this.setData({
      ['curTab.isLoaded']: true,
      ['curTab.page']: { ...curTab.page, finished: curTab.page.page >= res.total_page },
      ['curTab.isEmpty']: ![...curTab.list, ...res.list].length,
      ['curTab.list[' + (curTab.page.page - 2) + ']']: res.list,
      ['curTab.loadStatus']: (curTab.page.page >= res.total_page) ? 'noMore' : 'loading'
    }, () => {
      console.log(this.data.curTab)
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getList();
  },
  closeShare() {
    this.setData({
      isShowShare: false
    })
    wx.hideLoading()
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
});