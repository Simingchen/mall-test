const app = getApp()
const regeneratorRuntime = app.runtime

let canvas = null
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    type: {
      type: Number,
      value: 0,
    },
    targetId: {
      type: Number,
      value: 0,
    },
    isCollect: {
      type: Boolean,
      value: false,
    },
    shareTitle: {
      type: String,
      value: '',
    },
    shareImg: {
      type: String,
      value: '',
    },
    detailId: {
      type: String,
      value: '',
    },
  },
  data: {
    isShowShare: false,
    isOpend: false,
  },
  methods: {
    goBack() {
      if (getCurrentPages().length < 2) {
        wx.switchTab({
          url: '/pages/index/index',
        })
        return false
      }
      wx.navigateBack()
    },
    closeShare() {
      this.setData({
        isShowShare: false
      })
      wx.setNavigationBarTitle({
        title: '详情',
      })
    },
    async collect() {
      const data = {
        type: this.data.type,
        id: this.data.targetId
      }
      await app.fetch({
        url: "api/C/Common/Collect/SetCollect",
        data
      })

      this.triggerEvent('onCollect', {
        isCollect: !this.data.isCollect
      });

      wx.showToast({
        title: this.data.isCollect ? '收藏成功' : '已经取消收藏',
        icon: 'none'
      })

    },
    setPoster() {
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
      let that = this;

      wx.setNavigationBarTitle({
        title: '分享到朋友圈',
      })

      console.log(app.globalData.userInfo)

      var nickName = app.globalData.userInfo.WxNickname; // 昵称
      var headImg = app.globalData.userInfo.WxAvatarUrl; // 头像

      var timestamp = Date.parse(new Date());
      var date = new Date(timestamp);
      //获取年份  
      var Y = date.getFullYear();
      //获取月份  
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      //获取当日日期 
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      const seeDate = Y + "-" + M + "-" + D
      // const seeDate = formatTime(new Date());

      console.log(nickName);
      // 创建画布
      // const canvas = res[0].node
      // const ctx = canvas.getContext('2d')
      const width = res[0].width
      const height = res[0].height

      canvas = res[0].node
      const ctx = canvas.getContext('2d')

      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // 白色背景
      ctx.fillStyle = "#fff"

      let img1Height = 230
      // 资讯 = 1,
      // 服务商 = 2,
      // 服务商圈 = 30,
      // 管理圈 = 31,
      // 专业圈 = 32,
      // 方案 = 4,
      // 活动 = 5
      if (this.data.type == 5) {
        img1Height = 110
      }
      ctx.fillRect(0, 0, 300, img1Height + 130)

      // 主图
      let img1 = canvas.createImage();
      if (this.data.type == 31 || this.data.type == 32) {
        img1.src = '../../static/share.png'
      } else {
        img1.src = that.data.shareImg;
      }
      img1.onload = async (res) => {
        console.log(res)
        ctx.drawImage(img1, 0, 0, 300, img1Height)

        // 设置字体
        ctx.font = "14px Arial";
        // 设置水平对齐方式
        //  ctx.textAlign = "center";
        // 设置颜色
        ctx.fillStyle = '#333333FF' // 文字颜色：黑色
        let title = that.data.shareTitle

        console.log(title.length)
        if (title.length <= 14) {
          // 不用换行
          ctx.fillText(title, 10, img1Height + 20, 180)
        } else {
          // 超过两行
          let firstLine = title.substring(0, 14);
          let secondLine = title.substring(14, 27) + '...';
          ctx.fillText(firstLine, 10, img1Height + 20, 180)
          ctx.fillText(secondLine, 10, img1Height + 40, 180)
        }

        function getCurrentPageUrl() {
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          const url = `${currentPage.route}`
          return url
        }
       
        const data = {
          page: `${getCurrentPageUrl()}`,
          width: 500,
          id: this.data.targetId
        }

        const imgUrl = await app.fetch({
          method: 'post', 
          url: "api/C/Anonymous/MiniApp/CreateWxShareCode",
          data
        })
        // 下载二维码
        let img2 = canvas.createImage();
        img2.src = imgUrl.Url ? `https://www.rc-pt.cn${imgUrl.Url}` : '../../static/qr.jpg';
        img2.onload = (res) => {
          let qrImgSize = 70
          ctx.drawImage(img2, 220, img1Height + 20, qrImgSize, qrImgSize)
          // 观看日期
          ctx.font = "10px Arial";
          ctx.fillStyle = '#666666FF' // 文字颜色：黑色
          ctx.fillText('在' + seeDate + '分享到朋友圈', 10, img1Height + 75)

          // 用户昵称
          ctx.font = "14px Arial";
          // 设置颜色
          ctx.fillStyle = '#666666FF' // 文字颜色：黑色
          ctx.fillText(nickName, 40, img1Height + 105)

          // 识别二维码
          ctx.font = "10px Arial";
          // 设置水平对齐方式
          //  ctx.textAlign = "center";
          // 设置颜色
          ctx.fillStyle = '#666666FF' // 文字颜色：黑色
          ctx.fillText('长按识别二维码', 220, img1Height + 110)
          
          // 用户头像
          let img3 = canvas.createImage();
          img3.src = headImg,
            img3.onload = (res) => {
              // 先画圆形，制作圆形头像(圆心x，圆心y，半径r)
              ctx.arc(22, img1Height + 100, 12, 0, Math.PI * 2, false)
              ctx.clip()
              // 绘制头像图片
              let headImgSize = 24
              ctx.drawImage(img3, 10, img1Height + 90, headImgSize, headImgSize)
              

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
      }
    },
    togglePopup () {
      this.setData({isOpend: !this.data.isOpend})
    }
  }
})