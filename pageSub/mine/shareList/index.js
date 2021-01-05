const app = getApp()
const regeneratorRuntime = app.runtime
import {roundRectColor, circleImg} from "../../../utils/util.js"
Page({
  data: {
    searchTxt: '',
    isShowShare: false,
    shareTitle: '更多优惠商品，尽在澳米特商城...',
    qrCode: '',
    name: "珍惜健康才会拥有健康，好运从扫码互道早安开始",
    banner: "https://img.lhssbio.com/images/20201229/5fea1ee848b61.jpg",
    curTab: {
      isLoaded: false,
      loadStatus: "loading", // 加载状态
      isEmpty: false, // 是否空白数据
      page: { // 页码
        page: 1,
        size: 10,
        finished: false
      },
      list: []
    },
  },
  async onLoad(options) {
    this.getList(true)
  },
  // tab 切换
  tabsChange: app.throttle(function ({
    detail
  }) {
    this.getList(true)
  }),
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
      this.loading = true

      // 清空数据
      this.setData({
        ['curTab.list']: [],
        ['curTab.page.finished']: false,
        ['curTab.page.page']: 1,
        ['curTab.loadStatus']: 'loading'
      })
    }
    if (curTab.page.finished) return;

    let data = {
      "page_size": curTab.page.size,
      "page": curTab.page.page,
      "uid": app.globalData.userInfo.id || '',
    }

    this.loading = true
    app.fetch({
      url: "Api/Order/mylist",
      data
    }).then(res => {
      curTab.page.page++

      console.log(curTab.page.page)
      this.loading = false

      this.setData({
        ['curTab.isLoaded']: true,
        ['curTab.page']: { ...curTab.page, finished: res.data.length < 10 },
        ['curTab.isEmpty']: ![...curTab.list, ...res.data].length,
        ['curTab.list[' + (curTab.page.page - 2) + ']']: res.data,
        ['curTab.loadStatus']: res.data.length < 10 ? 'noMore' : 'loading'
      }, () => {
        console.log(this.data.curTab.page)
      })
    }).catch(err => {
      this.setData({
        ['curTab.isLoaded']: true,
        ['curTab.page']: { ...curTab.page, finished: true },
        ['curTab.list']: [],
        ['curTab.loadStatus']: 'noMore'
      })
    })
  },
  // 跳转到详情
  goDetail({ currentTarget }) {
    const item = currentTarget.dataset.item
    wx.navigateTo({
      url: `/pageSub/mine/orderDetail/index?id=${item.id}`,
    })
  },
  // 复制订单号
  copy({ currentTarget }) {
    const item = currentTarget.dataset.item
    wx.setClipboardData({
      data: item.order_no,
      success: function(res) {
          console.log("订单号复制成功")
      }
    })
  },
  // 输入框更改
 onChangeInput({currentTarget, detail}) {
    const string = detail.trim()
    this.setData({
      [currentTarget.dataset.type]: string
    }, () => {
      if (currentTarget.dataset.type == "payPassword") {
        if (string.length > 5) {
          this.accountPay(string)
        }
      }
    })
  },
  // 分享
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
    // console.log(res)
    let that = this;

    // 创建画布
    const width = res[0].width
    const height = res[0].height

    const canvas = res[0].node
    const ctx = canvas.getContext('2d')

    const dpr = wx.getSystemInfoSync().pixelRatio
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 顶部头像
    const userInfo = app.globalData.userInfo || {}
    let avatar = canvas.createImage();
    avatar.src = userInfo.headimg

    avatar.onload = (scaleBy = 2) => {
      const avatarX = 14
      const avatarY = 14
      const avatarW = 30
      // ctx.drawImage(avatar, avatarX, avatarX, avatarW, avatarW);
      circleImg(ctx, avatar, avatarX, avatarY, avatarW);
      
      // name
      ctx.font = "14px";
      ctx.fillText(userInfo.nickname, 56, 24, 100)
      ctx.font = "12px";
      ctx.fillText("为你挑选了一个好物", 56, 40, 150)
    }

    // 红色背景
    roundRectColor(ctx, 0, 0, 290, 468, 18, "#fc7b51")

    // 变色背景
    roundRectColor(ctx, 15, 57, 260, 395, 18, "#fff")

    // 主图
    let img1 = canvas.createImage();
    img1.src = this.data.banner

    img1.onload = async (res) => {
      // console.log(res)
      ctx.drawImage(img1, 28, 68, 235, 235, 28, 68, 235, 235)

      // 设置字体
      ctx.font = "14px Arial";
      // 设置水平对齐方式
      //  ctx.textAlign = "center";
      // 设置颜色
      ctx.fillStyle = '#333' // 文字颜色：黑色
      let title = that.data.name 
      let txtWidth = 235
      if (title.length <= 14) {
        // 不用换行
        ctx.fillText(title, 30, 325, txtWidth)
      } else if (title.length <= 28) {
        // 两行
        let firstLine = title.substring(0, 14);
        let secondLine = title.substring(14, 27);
        ctx.fillText(firstLine, 30, 325, txtWidth)
        ctx.fillText(secondLine, 30, 340, txtWidth)
      } else {
        // 超过两行
        let firstLine = title.substring(0, 16);
        let secondLine = title.substring(16, 34);
        let line3 = title.substring(34);

        if (title.length > 40) {
          line3 = title.substring(34, 40) + '...'
        }
        ctx.fillText(firstLine, 30, 320, txtWidth)
        ctx.fillText(secondLine, 30, 340, txtWidth)
        ctx.fillText(line3, 30, 360, txtWidth)
      }

      // price
      ctx.fillStyle = '#ca000e'
      // ctx.fillText("￥" + that.data.detail.price, 30, 420, 100)

      const data = {
        // page: 'pages/index/index',
        page: 'pageSub/index/goodsDetail/index',
        "uid": app.globalData.userInfo.id,
        id: this.data.id,
        // width: 500,
        // id: 4
      }
      
      // 下载二维码
      let img2 = canvas.createImage();

      if (!this.data.qrCode) {
        const imgUrl = await app.fetch({ url: "Api/Goods/share", data })
        var codeUrl = "https://miniapp.lhssbio.com/" + (imgUrl.qrcode || "Public/Uploads/Qrcode/uid2qrcode.jpg")
        img2.src = codeUrl;

        console.log(codeUrl)
        this.setData({
          qrCode: codeUrl
        })
      } else {
        img2.src = this.data.qrCode;
      }
      img2.onload = (res) => {
        console.log(res)
        let qrImgSize = 70
        ctx.drawImage(img2, 195,  370, qrImgSize, qrImgSize)

        wx.hideLoading()

        // 保存到相册
        var that = this
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
      img2.error = (err) => {
        console.log(err)
        wx.hideLoading()
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