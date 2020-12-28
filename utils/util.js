export const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 时间戳方案 截流
export function throttle(fn, wait = 300) {
  var pre = Date.now();
  return function () {
    var context = this;
    var args = arguments;
    var now = Date.now();
    if (now - pre >= wait) {
      fn.apply(context, args);
      pre = Date.now();
    }
  }
}

export function roundRectColor(context, x, y, w, h, r, bg) {  //绘制圆角矩形（纯色填充）
  context.save();
  context.fillStyle = bg || "#fff"
  context.strokeStyle = bg || "#fff"
  // context.setFillStyle("#abc"); 
  // context.setStrokeStyle('#abc')
  context.lineJoin = 'round';  //交点设置成圆角
  context.lineWidth = r;
  context.strokeRect(x + r/2, y + r/2, w - r , h - r );
  context.fillRect(x + r, y + r, w - r * 2, h - r * 2);
  context.stroke();
  context.closePath();
}

