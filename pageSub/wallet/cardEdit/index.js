const app = getApp()
const regeneratorRuntime = app.runtime
Page({
  data: {
    name: '',
    cardNum: '',
    bank: '',
    phone: '',
    isEdit: false,
    id: 0,
  },
  onLoad(options) {
    let detail = {}

    console.log(options)
    if (options.item && options.item != "{}") {
      detail = JSON.parse(decodeURIComponent(options.item));
      this.setData({
        name: detail.name,
        cardNum: detail.card,
        bank: detail.site,
        phone: detail.tel,
      })
    };
    wx.setNavigationBarTitle({
      title: detail.id > 0 ? '编辑银行卡' : '添加银行卡',
    })
    this.setData({
      isEdit: detail.id > 0,
      id: detail.id,
    })
  },
  // 输入框更改
 onChangeInput({currentTarget, detail}) {
  this.setData({
    [currentTarget.dataset.type]: detail.trim()
  })
 },
  // 保存地址
  async save() {
    const par = this.data

    if (!par.name.length) {
      return app.toast('请输入持卡人姓名')
    }
    if (!par.cardNum.length) {
      return app.toast('请输入卡号')
    }

    var regExp = /^([1-9]{1})(\d{15}|\d{18})$/; 
    if (!regExp.test(par.cardNum)) {
      return app.toast('银行卡长度格式有误')
    }

    if (!par.bank.length) {
      return app.toast('请输入开户行')
    }
    if (!par.phone.length) {
      return app.toast('请输入手机号')
    }
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(par.phone)) {
      return app.toast('手机号格式不正确')
    }

    const data = {
      "uid": app.globalData.userInfo.id,
      "name": par.name,
      "card": par.cardNum,
      "site": par.bank,
      "tel": par.phone,
    }
    if (par.id) {
      data.id = par.id
    }
    const res = await app.fetch({
      url: "Api/Wallet/bank_bind",
      data
    })

    app.toast('保存成功')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 500)
  },
  // 删除地址
  remove() {
    wx.showModal({
      title: "提示",
      content: "删除银行卡？",
      confirmColor: "#272c4c",
      success: async(res) => {
        if (res.confirm) {
          console.log('用户点击确定')

          const data = {
            id: this.data.id,
            "uid": app.globalData.userInfo.id,
          }
          app.fetch({
            url: "Api/Wallet/bank_bind",
            data
          }).then(res=> {}).catch(res => {
            // app.toast('删除成功')
      
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 500)
          })
          
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
});