const app = getApp()
const regeneratorRuntime = app.runtime
import cityList from '../../../static/city.js'
Page({
  data: {
    userName: '',
    phone: '',
    area: '',
    address: '',
    areaValues: [],
    isShowArea: false,
    areaList: cityList,
    checked: false, // 默认地址
    isEdit: false
  },
  onLoad(option) {
    let detail = {}
    if (option.scene) {
      wx.setStorageSync('scene', option.scene)
    }
  },
  togglePop() {
    this.setData({
      isShowArea: !this.data.isShowArea
    })
  },
  onChange({
    currentTarget
  }) {
    const checked = currentTarget.dataset.checked
    this.setData({
      checked: !checked
    })
  },
  confirmArea({
    detail
  }) {
    this.togglePop()
    console.log(detail.values)
    const address = detail.values
    this.setData({
      areaValues: address,
      area: `${address[0].name}/${address[1].name}/${address[2].name}`
    })
  },
  // 保存地址
  async save() {
    const par = this.data

    console.log(par)
    
    if (!par.userName.length) {
      return app.toast('姓名不能为空')
    }
    if (!par.phone.length) {
      return app.toast('手机号不能为空')
    }
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(par.phone)) {
      return app.toast('手机号格式不正确')
    }

    if (!par.areaValues.length) {
      const area = par.area.split('/')
      par.areaValues = [
        {name: area[0]},
        {name: area[1]},
        {name: area[2]},
      ]
    }

    if (!par.areaValues[0].name) {
      return app.toast('请选择地区')
    }
    const data = {
      "id": par.id,
      "accept_name": par.userName,
      "province": par.areaValues[0].name,
      "city": par.areaValues[1].name,
      "area": par.areaValues[2].name,
      "address": par.address,
      "mobile": par.phone,
    }
    const res = await app.fetch({
      method: 'post',
      url: "SaveUserAddress.ashx",
      data
    })

    app.toast('保存成功')

    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      })
    }, 1000)
  },
});