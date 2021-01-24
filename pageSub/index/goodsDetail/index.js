const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");
import {roundRectColor, circleImg, coverImg} from "../../../utils/util.js"
Page({
  data: {
    detail: {},
    cartNum: 0,
    isSeckillEnd: false,   // 团购未结束
    skuSHow: '',
    curSku: {
      sku0: {},
      sku1: {}
    },
    skuDetail: {},
    quality: 1,
    // 分享
    isShowShare: false,
    isOpend: false,
    shareTitle: '更多优惠商品，尽在澳米特商城...',
    userConfig: {},
    qrCode: '',
    userInfo: {},
    realPrice: 0,   // 实际价格
    isShowTips: false,
  },
  async onLoad (option) {
    console.log(option)
    
     try {
      let detail = {}
      // 存储邀请码
      if (option.scene) {
        const par = decodeURIComponent(option.scene)
        const ICode = app.getQueryString(par, 'uid')
        detail.id = app.getQueryString(par, 'id')
        if (ICode) {
          wx.setStorageSync('ICode', ICode)
        }

        this.setData({
          detail
        }, () => {
          this.getData(detail)
        })
        return false
      }

      if(option.ICode) {
        wx.setStorageSync('ICode', option.ICode)
      }
     
      if(option.item) {
        detail = JSON.parse(decodeURIComponent(option.item));

        this.setData({
          detail
        }, () => {
          this.getData(detail)
        })
      };

      if (option.id) {
        detail = {
          "id": option.id,
        }

        this.getData(detail)
      }
      
    } catch (e) {
      console.error(e)
    }

    const userInfo = app.globalData.userInfo || {}

    this.setData({ userInfo })
  },
  onUnload () {
    clearTimeout(this.timer)
  },
  openTipsPop() {
    this.setData({
      isShowTips: true
    })
  },
  onCloseTips(){
    this.setData({
      isShowTips: false
    })
  },
  setInfo (detail) {
    this.setData({ 
      detail,
      quality: detail.jxs_low_num > 0 ? detail.jxs_low_num : 1,   // 经销商取最低购买数
      realPrice: detail.jxs_price > 0 ? detail.jxs_price : detail.price,
    })
    if (detail.msg) {
      wxparse.wxParse('content', 'html', detail.msg, this, 5)
    }
  },
  async getData (par) {
    const data = {
      "id": par.id,
      uid: app.globalData.userInfo.id
    }
    let detail = await app.fetch({url: "Api/Goods/detail", data })
    this.setInfo(detail)
  },
  // 获取sku列表
  async getSkuList (article_id, channel_id) {
    const skuList = await app.fetch({url: "GetGoodsSpec.ashx", data: {article_id, channel_id} })
    const skuSHow = skuList.map(item => {
      return item.title
    }).join(' ')
    this.setData({
      skuList,
      skuSHow
    })
  },
  // 获取sku 详情
  async getSkuData () {
    const { curSku, detail, skuList } = this.data
    let spec_ids;
    if (skuList.length == 1) {
      spec_ids = `,${curSku.sku0.spec_id},`
    }
    if (skuList.length == 2) {
      spec_ids = `,${curSku.sku0.spec_id},${curSku.sku1.spec_id},`
    }
    const data = {
      channel_id: detail.channel_id,
      article_id: detail.id,
      spec_ids
    }
    const skuDetail = await app.fetch({url: "GetGoodsInfo.ashx", data })
    
    this.setData({
      skuDetail
    })
  },
  //转发
  onShareAppMessage: function (res) {
    console.log("button分享页面的内容")
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    const { detail } = this.data

    const userInfo = app.globalData.userInfo || {}
    
    let path = `/pageSub/index/goodsDetail/index?id=${detail.id}`
    // 经销商才有邀请注册
    if (userInfo.type == 2) {
      path = path + `&ICode=${userInfo.id}`
    }

    console.log("userInfo=====>", path)
    return {
      title: detail.name,
      path,
    }
  },
  toggleSku ({currentTarget}) {
    const type = currentTarget.dataset.type || 1
    this.setData({
      curSkuPopType: type,
      isShowSku: !this.data.isShowSku
    })
  },
  // 选择SKu
  chooseSku ({currentTarget}) {
    const item = currentTarget.dataset.item
    // 确定行
    const index = currentTarget.dataset.index

    let tempSku = {}

    tempSku['sku' + index] = item

    let curSku = {
      ...this.data.curSku,
      ...tempSku,
    }

    this.setData({
      curSku: curSku,
    }, () => {
      const { skuList } = this.data
      if (skuList.length == 1) {
        this.getSkuData()
      }

      if (skuList.length == 2) {
        // 选择完 sku, 获取接口 SKU 详情
        if (!!curSku.sku0.spec_id && !!curSku.sku1.spec_id) {
          this.getSkuData()
        }
      }
    })
  },
  // 更改数量
  changeGoodsNum ({detail}) {
    console.log(detail)
    const price = this.data.detail.jxs_price

    let realPrice = this.data.detail.price
    if (price && price > 0 && detail >= this.data.detail.jxs_low_num) {
      realPrice = price
    }
    this.setData({
      quality: detail,
      realPrice,
    })
  },
  // 确定sku
  confirmSku () {
    const userInfo = app.globalData.userInfo || {}
    if (!userInfo.id) {
      app.toast("请先登录")
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/index',
        })
      }, 1000)
      return false
    }
    this.buyIt()
  },
  // 立即购买
  async buyIt () {
    // this.setData({
    //   isShowSku: !this.data.isShowSku
    // }) 
    const { detail, quality } = this.data
    
    if (parseFloat(quality) > parseFloat(detail.sku)) {
      return app.toast('库存不足')
    }   

    const par = {
      ...this.data.detail,
      quality: this.data.quality,
      realPrice: this.data.realPrice
    }

    const item = encodeURIComponent(JSON.stringify(par))
    wx.navigateTo({
      url: `/pageSub/index/submitOrder/index?item=${item}`,
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
    // const width = res[0].width
    // const height = res[0].height
    const width = 290
    const height = 468

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
    roundRectColor(ctx, 0, 0, width, height, 18, "#fc7b51")

    // 变色背景
    roundRectColor(ctx, 15, 57, 260, 395, 18, "#fff")

    // 主图
    let img1 = canvas.createImage();
    img1.src = this.data.detail.banner

    img1.onload = async (res) => {
      // 实现 cover 效果
      let imgDta = coverImg(img1.width, img1.height, 235 / 235)　
  　　ctx.drawImage(img1, imgDta.sx, imgDta.sy, imgDta.sw, imgDta.sh, 28, 68, 235, 235)

      // 设置字体
      ctx.font = "14px Arial";
      // 设置水平对齐方式
      //  ctx.textAlign = "center";
      // 设置颜色
      ctx.fillStyle = '#333' // 文字颜色：黑色
      let title = that.data.detail.name 
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
      ctx.fillText("￥" + that.data.detail.price, 30, 420, 100)

      const data = {
        // page: 'pages/index/index',
        page: 'pageSub/index/goodsDetail/index',
        "uid": app.globalData.userInfo.id,
        id: this.data.detail.id,
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