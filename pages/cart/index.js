const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    isEdit: false, // 是否是编辑状态
    result: [],
    isCheckedAll: false,
    allCheckPrice: 0, // 选中总价
    finished: false,
    goodsList: [],
    validGoods: [], // 有效商品
    invalidGoods: [], // 无效商品
    isLoaded: false, // 是否加载过数据
    cartNum: 0,
  },
  onShow() {
    this.getData()
  },
  async getData() {
    const res = await app.fetch({
      method: 'post',
      url: `GetMyCart.ashx`
    })

    app.globalData.cartNum = res.GoodsList.length

    this.setData({
      isLoaded: true,
      finished: true,  // 加载所有完成
      goodsList: res.GoodsList
    })

    // 过滤有效商品
    var validGoods = res.GoodsList.filter(item =>{
      return !item.isDisabled
    })
    // 过滤无效商品
    var invalidGoods = res.GoodsList.filter(item => {
      return item.isDisabled
    })

    this.setData({
      validGoods,
      invalidGoods
    })
  },
  // 编辑切换
  toggleEdit: app.throttle(function () {
    this.setData({
      isEdit: !this.data.isEdit,
      result: [],
      isCheckedAll: false
    })
  }),
  // 提交
  onSubmit: app.throttle(async function () {
    if (this.data.isEdit) {
      // 删除所选
      wx.showModal({
        title: '提示',
        confirmColor: "#ee0a24",
        content: '确定删除所选商品?',
        success: async (res) => {
          if (res.confirm) {
            
            const goods = this.data.result.join(',')
            var validGoods = this.data.goodsList.filter(item =>{
              return this.data.result.indexOf(String(item.goods_id)) != -1
            })
            let article_id = validGoods.map(item => {
              return item.article_id
            })
            article_id = article_id.join(',')
            
            const data = {
              "clear": "0",
              "article_ids": `,${article_id},`,
              "goods_ids": `,${goods},`
            }
            await app.fetch({ method: 'post', url: "DeleteCartGoods.ashx", data })

            app.toast('删除成功')
            var goodsList = this.data.goodsList.filter(item => {
              return this.data.result.indexOf(String(item.goods_id)) != -1
            })

            // 清空结果
            this.setData({
              goodsList,
              result: [],
              isCheckedAll: false
            }, () => {
              this.getData()
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

      return false
    }

    // 提交商品到订单  
    if (!this.data.result.length) {
      return app.toast('请选择结算商品')
    }

    var validGoods = this.data.goodsList.filter(item =>{
      return this.data.result.indexOf(String(item.goods_id)) != -1
    })

    console.log(validGoods)
    var parList = validGoods.map(function (item) {
      return {
        "article_id": item.article_id,
        "goods_id": item.goods_id,
        "quantity": item.quantity,
        channel_id: item.channel_id
      }
    })

    const data = {
      "goodsJsonData": parList
    }

    const item = encodeURIComponent(JSON.stringify(data))

    wx.navigateTo({
      url: `/pageSub/index/submitOrder/index?item=${item}`,
      success: () => {
        // 重置操作
        this.setData({
          result: [],
          isCheckedAll: false,
          allCheckPrice: 0,
        })
      }
    })
    // await app.fetch({url: "BuyCartGoods.ashx", data })
  }),
  // check改变
  checkChage({ detail }) {
    console.log(detail)
    this.setData({
      result: detail,
    });
    if (this.data.isEdit) {
      // 编辑状态失效商品可选
      this.setData({
        isCheckedAll: detail.length >= this.data.goodsList.length
      })
    } else {
      this.setData({
        isCheckedAll: detail.length >= this.data.validGoods.length
      })
      // 计算价格
      var filterList = this.data.goodsList.filter( item=> {
        return detail.indexOf(String(item.goods_id)) != -1
      })
      var tempPrice = 0
      filterList.forEach(item => {
        tempPrice += item.sell_price * item.quantity
      });

      this.setData({
        allCheckPrice: tempPrice * 100
      })
    }
  },
  // 全选、全不选
  checkAll: app.throttle(function () {
    const { goodsList } = this.data
    var validList = goodsList.map(function (item) {
      return String(item.goods_id)
    })

    console.log(validList)
    
    const { isCheckedAll } = this.data

    let allCheckPrice = 0

    if (!this.data.isEdit) {
      var tempPrice = 0
      goodsList.forEach(item => {
        tempPrice += item.sell_price * item.quantity
      });

      allCheckPrice = tempPrice * 100
    }

    this.setData({
      result: !isCheckedAll ? validList : [],
      isCheckedAll: !isCheckedAll,
      allCheckPrice: !isCheckedAll ? allCheckPrice : 0
    })

    
  }),
  // 去逛逛
  goUrl: app.throttle(function () {
    wx.switchTab({
      url: '/pages/goodsSort/index',
    })
  }),
});