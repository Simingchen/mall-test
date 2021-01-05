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

// r: 半径
export function circleImg(ctx, img, x, y, r) {
  ctx.save();

  ctx.beginPath(); //开始绘制
  //先画个圆  前两个参数确定了圆心 （x,y） 坐标 第三个参数是圆的半径 四参数是绘图方向 默认是false，即顺时针
  ctx.arc(r / 2 + x, r / 2 + y, r / 2, 0, Math.PI * 2, false);

  ctx.clip(); //画好了圆 剪切 原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
  ctx.drawImage(img, x, y, r, r);
  ctx.restore();

} 

