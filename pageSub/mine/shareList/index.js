const app = getApp()
const regeneratorRuntime = app.runtime
import {roundRectColor, circleImg, coverImg} from "../../../utils/util.js"
Page({
  data: {
    searchTxt: '',
    isShowShare: false,
    qrCode: '',
    name: "",
    nameList: [],
    curItem: {},
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
    day: "",
    time: "",
    dateTime: ""
  },
  async onLoad(options) {
    this.getList(true)

    this.getCode()

    this.getDate()
  },
  getDate() {
    function formatNumber (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }

    const date = new Date()

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    this.setData({
      day: formatNumber(day),
      dateTime: year + "." + formatNumber(month),
      time: formatNumber(hour) + ":" + formatNumber(minute),
    })
  },
  async getCode() {
    var code = await app.fetch({
      url: "Api/User/promote",
      data: {uid: app.globalData.userInfo.id}
    })
    this.setData({
      qrCode: "https://miniapp.lhssbio.com/" + code
    })
  },
  // tab 切换
  tabsChange: app.throttle(function ({
    detail
  }) {
    this.getList(true)
  }),
  // getRandomNumber
  getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  async getList(init) {
    const {
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
      "uid": app.globalData.userInfo.id || 0,
    }

    this.loading = true
    app.fetch({ url: "Api/DaylyShare/index",
    }).then(res => {
      curTab.page.page++

      console.log(res)
      this.loading = false

      this.setData({
        ['curTab.isLoaded']: true,
        ['curTab.isEmpty']: ![...curTab.list, ...res.pic].length,
        ['curTab.list[' + (curTab.page.page - 2) + ']']: res.pic,
        ['curTab.loadStatus']: 'noMore',
        curItem: res.pic[0],
        nameList: res.content,
        name: res.content
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
  // 图片更改
  changeImg({ currentTarget }) {
    const item = currentTarget.dataset.item
    this.setData({
      curItem: item
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
  async setPoster2(res) {
    // console.log(res)
    let that = this;

    // 创建画布
    // const width = res[0].width
    // const height = res[0].height
    const width = 290
    const height = 448

    const canvas = res[0].node
    const ctx = canvas.getContext('2d')

    const dpr = wx.getSystemInfoSync().pixelRatio
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // console.log(width, dpr)

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
      ctx.fillText("每日分享", 56, 40, 150)
    }

    // 红色背景
    roundRectColor(ctx, 0, 0, width, height, 18, "#272c4c")

    // 变色背景
    roundRectColor(ctx, 15, 57, 260, 375, 18, "#fff")

    // 主图
    let img1 = canvas.createImage();
    img1.src = this.data.curItem.picture

    // const t = await this.compressImage(this.data.curItem.picture)
    // console.log(t)

    img1.onload = async (res) => {
      // 实现 cover 效果
      let imgDta = coverImg(img1.width, img1.height, 235 / 235)　
  　　ctx.drawImage(img1, imgDta.sx, imgDta.sy, imgDta.sw, imgDta.sh, 28, 68, 235, 235)
     
      // ctx.drawImage(img1, 28, 68, 235, 235, 28, 68, 235, 235)

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

      // 时间
      ctx.font = "20px Arial";
      ctx.fillStyle = '#333'
      // + that.data.time
      ctx.fillText(that.data.dateTime + "." + that.data.day, 30, 400, 200)

      // 下载二维码
      let img2 = canvas.createImage();

      if (!this.data.qrCode) {
        var code = await app.fetch({
          url: "Api/User/promote",
          data: {uid: app.globalData.userInfo.id || 0}
        })
        this.setData({
          qrCode: "https://miniapp.lhssbio.com/" + code
        })
      } else {
        img2.src = this.data.qrCode;
      }
      img2.onload = (res) => {
        console.log(res)
        let qrImgSize = 70
        ctx.drawImage(img2, 195,  350, qrImgSize, qrImgSize)

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
  compressImage(picture) {
    console.log(picture)
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: picture, // 图片路径
        quality: 80, // 压缩质量
        success: function(res) {
          console.log(res)
          resolve(res)
        },
        fail(res) {
          console.log(res)
          resolve(res)
        }
      })
    })
  }
});