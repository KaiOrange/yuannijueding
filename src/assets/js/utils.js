export function convertLrcObject (lrcData = '') {
  let lrc = lrcData.split(/\n/);
  var timeReg = /\[\d{2}:\d{2}\.\d{2}\]/g;//匹配时间的正则表达式
  var result = [];
  for (var i=0;i<lrc.length;i++) {
      var time = lrc[i].match(timeReg); //获取歌词里的时间
      var value = lrc[i].replace(timeReg, ""); //获取纯歌词文本
      for (var j=0;j<time.length;j++ ) {
          var t = time[j].slice(1, -1).split(":"); //t[0]分钟，t[1]秒
          var timeArr = parseInt(t[0], 10) * 60 + parseFloat(t[1]);
          result.push([timeArr, value]);//以[时间(秒)，歌词]的形式存进result
      }
  }
  result.sort((a,b)=>(a[0] - b[0]));
  return result;
}