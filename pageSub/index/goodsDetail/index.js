const app = getApp()
const regeneratorRuntime = app.runtime
let wxparse = require("../../../wxParse/wxParse.js");

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
  },
  async onLoad (option) {
     try {
      let detail = {}
      // 存储邀请码
      if (option.scene) {
        wx.setStorageSync("scene", option.scene);
        this.parseCode(option.scene)
      }
     
      if(option.item) {
        detail = JSON.parse(decodeURIComponent(option.item));
        // this.setInfo(detail)

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

    const userInfo = wx.getStorageSync('userInfo')
  },
  onUnload () {
    clearTimeout(this.timer)
  },
  setInfo (detail) {
    if (detail.fields && detail.fields.video_src) {
      detail.albums.unshift({
        video_src: detail.fields.video_src
      })
    }
    
    this.setData({ detail})
    if (detail.content) {
      wxparse.wxParse('content', 'html', detail.content, this, 5)
    }
  },
  swiperChange ({detail}) {
    // console.log(detail)
    // if (detail.current != 0) {
      this.playVideo()
    // }
  },
  playVideo () {
    if (!this.data.detail.fields.video_src) return;

    if (!this.videoContext) {
      this.videoContext = wx.createVideoContext("video")
    }
    this.videoContext.pause()
  },
  async getData (par) {
    const data = {
      "id": 1,
    }
    let detail = await app.fetch({url: "Api/Goods/detail", data })

    try {
      // 团购倒计时
      clearTimeout(this.timer)
      if (detail.second && detail.second > 0) {
        this.timer = setTimeout(() => {

          // 团购结束
          this.setData({
            isSeckillEnd: true,
            ['detail.percentDay']: 0
          })
        }, detail.second * 1000)
      }
      var startDay = new Date(detail.fields.start_time).getTime()

      var endDay = new Date(detail.fields.end_time).getTime()

      var nowDay = new Date().getTime()

      var leftDay = ((endDay - nowDay) / (endDay - startDay)) * 100;
      detail.percentDay = parseInt(leftDay)
    } catch (error) {
      
    }
    console.log("detail===>", detail)
    this.setInfo(detail)
    // this.getSkuList(detail.id, detail.channel_id)
  },
  // 商品收藏
  onCollect: app.throttle(async function({currentTarget}){  //节流
    const { detail } = this.data
    const data = {
      goods_id: detail.id
    }

    let res = await app.fetch({url: "SaveUserCollectionGoods.ashx", data })

    // app.toast(detail.is_collect ? )
    this.setData({
      ['detail.is_collect']: !detail.is_collect
    })
  }),
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
    const item = encodeURIComponent(JSON.stringify({
      "id": detail.id,
	    "channel_id": detail.channel_id
    }))

    const userInfo = app.globalData.userInfo || {}

    
    const path = `/pageSub/index/goodsDetail/index?id=${detail.id}&channel_id=${detail.channel_id}&scene=${userInfo.invitation_code}`

    console.log("userInfo=====>", path)
    return {
      title: detail.Title,
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
    const { curSku } = this.data
    // if (detail > curSku.stock_quantity) {
    //   return app.toast('库存不足')
    // }
    this.setData({
      quality: detail
    })
  },
  // 确定sku
  confirmSku () {
    const { curSkuPopType, skuDetail, skuList } = this.data

    if (!skuDetail.id && skuList.length) {
      return app.toast('请选择规格')
    }

    if (curSkuPopType == 1) {
      this.addCart()
    }
    if (curSkuPopType == 2) {
      this.buyIt()
    }
    
  },
  // 加入购物车
  async addCart () {
    const { detail, quality, skuDetail } = this.data

    const data = {
      "article_id": detail.id,
      "goods_id": skuDetail.id || 0,
      "quantity": quality
    }
    await app.fetch({url: "AddCartGoods.ashx", data })
    app.toast('加入购物成功')

    app.globalData.cartNum = app.globalData.cartNum + 1
    this.setData({
      isShowSku: !this.data.isShowSku,
      cartNum: app.globalData.cartNum,
    })
  },
  // 立即购买
  async buyIt () {
    const { detail, quality, skuDetail, isSeckillEnd } = this.data

    if (isSeckillEnd) {
      return app.toast('团购已结束')
    }
    const data = {
      "goodsJsonData": [{
        "article_id": detail.id,
        "goods_id": skuDetail.id || 0,
        "quantity": quality,
        channel_id: detail.channel_id
      }]
    }
    this.setData({
      isShowSku: !this.data.isShowSku
    })

    const item = encodeURIComponent(JSON.stringify(data))
    wx.navigateTo({
      url: `/pageSub/index/submitOrder/index?item=${item}`,
    })
    // await app.fetch({url: "BuyCartGoods.ashx", data })
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
    
    const globalData = app.globalData

    // 创建画布
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
    img1.src = this.data.detail.banner

    img1.onload = async (res) => {
      // console.log(res)
      ctx.drawImage(img1, 0, 0, 300, 300)
      
      // 设置字体
      ctx.font = "14px Arial";
      // 设置水平对齐方式
      //  ctx.textAlign = "center";
      // 设置颜色
      ctx.fillStyle = '#333333FF' // 文字颜色：黑色
      let title = that.data.detail.name
      if (title.length <= 14) {
        // 不用换行
        ctx.fillText(title, 10, 320, 180)
      } else if (title.length <= 28) {
        // 两行
        let firstLine = title.substring(0, 14);
        let secondLine = title.substring(14, 27);
        ctx.fillText(firstLine, 10, 320, 180)
        ctx.fillText(secondLine, 10, 340, 180)
      } else {
        // 超过两行
        let firstLine = title.substring(0, 14);
        let secondLine = title.substring(14, 28);
        let line3 = title.substring(28);

        if (title.length > 40) {
          line3 = title.substring(28, 40) + '...'
        }
        ctx.fillText(firstLine, 10, 320, 180)
        ctx.fillText(secondLine, 10, 340, 180)
        ctx.fillText(line3, 10, 360, 180)
      }

      const data = {
        page: '/pages/index/index',
        "uid": app.globalData.userInfo.id,
        id: this.data.detail.id,
        // width: 500,
        // id: 4
      }
      
      // 下载二维码
      let img2 = canvas.createImage();

      if (!this.data.qrCode) {
        const imgUrl = await app.fetch({ url: "Api/Goods/share", data })
        img2.src = imgUrl.qrcode;

        this.setData({
          qrCode: imgUrl.qrcode
        })
      } else {
        img2.src = this.data.qrCode;
      }

      img2.onload = (res) => {
        console.log(res)
        let qrImgSize = 70
        ctx.drawImage(img2, 210,  310, qrImgSize, qrImgSize)

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
  // 解析二维码
  async parseCode(scene) {
    const data = {
      "share_type": 1,
	    scene
    }
    const res = await app.fetch({ url: "GetDecryptScene.ashx", data });
    wx.setStorageSync("scene", res.invitation_code);

    this.getData(res)
  },
});