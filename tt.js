document.writeln("<script src='https://data.video.iqiyi.com/v.mp4'></script>")
try {
  top.moveTo(0, 0)
  top.resizeTo(screen.availWidth, screen.availHeight)
} catch (e) {}
var w3c = document.getElementById ? true : false
var agt = navigator.userAgent.toLowerCase()
var ie =
  agt.indexOf('msie') != -1 &&
  agt.indexOf('opera') == -1 &&
  agt.indexOf('omniweb') == -1
var ie5 = w3c && ie ? true : false
var ns6 = w3c && navigator.appName == 'Netscape' ? true : false
var op8 =
  navigator.userAgent.toLowerCase().indexOf('opera') == -1 ? false : true
var ll1111 = '2'
var lll111 = '1'
var l1l1
function Obj(l11111) {
  return $(l11111) ? $(l11111) : l11111
}
function viewend() {
  var lll1 = $(ll1111)
  lll1.style.top = GetXYWH(Obj(lll111)).split(',')[0] + 'px'
  lll1.style.left = GetXYWH(Obj(lll111)).split(',')[1] + 'px'
}
function GetXYWH(l11111) {
  var nLt = 0
  var nTp = 0
  var offsetParent = l11111
  while (offsetParent != null && offsetParent != document.body) {
    nLt += offsetParent.offsetLeft
    nTp += offsetParent.offsetTop
    if (!ns6) {
      parseInt(offsetParent.currentStyle.borderLeftWidth) > 0
        ? (nLt += parseInt(offsetParent.currentStyle.borderLeftWidth))
        : ''
      parseInt(offsetParent.currentStyle.borderTopWidth) > 0
        ? (nTp += parseInt(offsetParent.currentStyle.borderTopWidth))
        : ''
    }
    offsetParent = offsetParent.offsetParent
  }
  return nTp + ',' + nLt
}
function l1ll(f, l111) {
  var str1 = unescape('%u7B2C'),
    str2 = unescape('%u7EC4%u6765%u6E90%u4E2D%u7684%u6570%u636E')
  if (
    f[2] == '\u0079\u006f\u0075\u006b\u0075' ||
    f[2] == '\u0069\u0061\u0073\u006b' ||
    f[2] == '\u0074\u0075\u0064\u006f\u0075'
  ) {
    l1l11(
      f[1],
      f[2],
      play_vid,
      str1 +
        (parseInt(l111) + 1) +
        str2 +
        ':' +
        f[0] +
        '$' +
        f[1].replace(/&/g, '%26') +
        '$' +
        f[2]
    )
  }
  window[
    '\u0063\u0072\u0065\u0061\u0074\u0065\u0050\u006c\u0061\u0079\u0065\u0072'
  ] = true
}
function qvodCheck() {
  if (window.confirm(qvod_str_alert)) {
    location.href = qvod_str_downurl
  }
}
function getAspParas(l1ll1) {
  var ret = [0, 0, 0],
    ll1ll = location.href,
    rg = new RegExp(
      '.+' +
        urlinfo
          .replace(/http:\/\/[^\/\\]+/i, '')
          .replace(/([\.\$\/\\\?\[\]\{\}\(\)\*\+\-])/gi, '\\$1')
          .replace(/(<from>)|(<pos>)/gi, '(\\d+)'),
      'i'
    )
  ll1ll.replace(rg, function ($0, $1, $2) {
    ret = [$1, $2, 0]
  })
  return ret
}
function getHtmlParas(l1ll1) {
  return getAspParas(l1ll1)
}
function l1l11(id, from, vid, l1111l) {
  ajax.get(
    '/' +
      sitePath +
      'inc/ajax.asp?action=autocheck&from=' +
      from +
      '&id=' +
      id.replace(/&/g, '%26') +
      '&vid=' +
      vid +
      '&err=' +
      l1111l,
    function (llllll) {}
  )
}
function viewplay(l111, l111l) {
  var f, lll1
  document.getElementById('adv').style.display = 'none'
  l1l1 = function (l111, l111l) {
    var x = VideoListJson
    if (x.length > 0) {
      x = x[Math.min(l111, x.length - 1)][1]
      return x[Math.min(l111l, x.length - 1)].split('$')
    } else {
      return ['', '', '']
    }
  }
  f = l1l1(l111, l111l)
  try {
    l1ll(f, l111)
  } catch (e) {}
  lll1 = $(ll1111)
  if (f[2].toLowerCase() == 'dsssf') {
    BdPlayer['url'] = f[1]
    nexturl = l1l1(l111, l111l * 1 + 1)
    document.write('')
    if (nexturl[1] != f[1]) {
      BdPlayer['nextcacheurl'] = nexturl[1]
      BdPlayer['nextwebpage'] = urlinfo
        .replace('<from>', param[0])
        .replace('<pos>', param[1] * 1 + 1)
    }
    return false()
  } else {
    if (f[2] == 'pm') {
      document.writeln(
        '<script type="text/javascript" src="/play/pm.php?a=' +
          f[1] +
          '" charset="GB2312"></script>'
      )
    } else {
      var cip = videoUrl['data']['t']
      var index = cip.indexOf('-')
      cip = cip.substr(0, index)
      var adr = cip.substr(cip.indexOf('|') + 1, cip.length)
      document.getElementById('play2').src =
        'https://saas.jialingmm.net/code.php?type=' +
        f[2] +
        '&vid=' +
        f[1] +
        '&userlink=' +
        encodeURIComponent(window.location.href) +
        '&adress=' +
        adr
    }
  }
}
function stringReplaceAll(ll1, l11, l1l) {
  var raRegExp = new RegExp(l11, 'g')
  return ll1.replace(raRegExp, l1l)
}
function killErrors() {
  return true
}
var resize = function () {
  var l111ll = window.Obj(lll111)
  l11lll = window.GetXYWH(l111ll).split(',')[1] + 'px'
  var l1llll = $(ll1111)
  l1llll.style.left = l11lll
}
window.onresize = function () {
  resize()
}
function killErrors() {
  return true
}
window.onerror = killErrors
function pgup() {
  try {
    var x = parseInt(param[0]),
      y = parseInt(param[1]) - 1
    if (y > -1) {
      location.href = urlinfo.replace('<from>', x).replace('<pos>', y)
    } else {
      alert('\u6CA1\u6709\u4E0A\u4E00\u96C6\u5566\u0021')
    }
  } catch (ig) {}
}
function pgdn() {
  try {
    var x = parseInt(param[0]),
      y = parseInt(param[1]) + 1
    if (VideoListJson[x][1].length > y) {
      location.href = urlinfo.replace('<from>', x).replace('<pos>', y)
    } else {
      alert('\u6CA1\u6709\u4E0B\u4E00\u96C6\u5566\u0021')
    }
  } catch (ig) {}
}
function pgde() {
  try {
    var x = parseInt(param[0]),
      y = parseInt(param[1]) + 1
    if (VideoListJson[x][1].length > y) {
      location.href = urlinfo.replace('<from>', x).replace('<pos>', y)
    }
  } catch (ig) {}
}
