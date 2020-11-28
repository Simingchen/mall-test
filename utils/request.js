const baseURL = "http://8.129.87.241/lhss/Root/index.php/"

export default function fetch(options, globalData) {
  return new Promise((resolve, reject) => {
    let { url, data: reqParams, method = 'POST', isShowLoading = false } = options

    let token = wx.getStorageSync('token')
    let header = token ? { 'Authorization': token } : {}
    try {
      // if (method.toUpperCase() == 'POST' || method.toUpperCase() == 'PUT') {
      //   header['content-type'] = 'application/json'
      // }
      // 显示加载
      if (isShowLoading) { wx.showLoading({ title: '' }) }

      // 401.3：表示用户没有权限
      // if (isAuth) {
      //   console.log("该接口没有权限")
      //   resolve(401.3)
      //   return false
      // }
      // console.log(`${baseURL}`)
      // console.log(`${perUrl}`)
      // console.log(`${url}`)
      wx.request({
        url: `${baseURL + url}`,
        header,
        method,
        data: reqParams,
        success(responseData) {
          if (isShowLoading) { wx.hideLoading() }
          let { data: response } = responseData
          // 200：接口成功
          // 201：接口失败
          // 500：服务器繁忙
          // 405 当前用户未登录
          // 403 未能找到数据
          // 408 参数有误

          // 报错
          if (Object.prototype.toString.call(response) == "[object String]") {
            return reject()
          }
          response = (response && response[0]) || {}

          if (response.Status == 20) {
            wx.showToast({
              title: response.Msg,
              icon: "none"
            })

            if (response.Status == 405) {
              wx.navigateTo({
                url: '/pages/login/index',
              })
            }
            return false
          }

          if (response.Status == 500) {
            return wx.showToast({
              title: response.Msg,
              icon: "none"
            })
          }

          // 自动刷新token
          if (response && response.Data && response.Data[0] && response.Token) {
            wx.setStorageSync("token", response.Token)
          }
          resolve(response.Data && response.Data[0])
        },
        fail(err) {
          console.error(err)
          reject(err)
        }
      });
    } catch (error) {
      console.error("request err", error)
      if (isShowLoading) { wx.hideLoading() }
      if (error && (error.errMsg || error == 'TypeError: Failed to fetch')) {
        wx.showToast({ title: '网络错误', icon: "none" })
      }
      reject(error)
    }
  })
}