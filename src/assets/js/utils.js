export function convertLrcObject(lrcData = "") {
  let lrc = lrcData.split(/\n/);
  var timeReg = /\[\d{2}:\d{2}\.\d{2}\]/g; //匹配时间的正则表达式
  var result = [];
  for (var i = 0; i < lrc.length; i++) {
    var time = lrc[i].match(timeReg); //获取歌词里的时间
    var value = lrc[i].replace(timeReg, ""); //获取纯歌词文本
    for (var j = 0; j < time.length; j++) {
      var t = time[j].slice(1, -1).split(":"); //t[0]分钟，t[1]秒
      var timeArr = parseInt(t[0], 10) * 60 + parseFloat(t[1]);
      result.push([timeArr, value]); //以[时间(秒)，歌词]的形式存进result
    }
  }
  result.sort((a, b) => a[0] - b[0]);
  return result;
}

const CHAR2EMOJI = {
  "[大笑]": "😀",
  "[可爱]": "😊",
  "[憨笑]": "😄",
  "[色]": "😍",
  "[亲亲]": "😘",
  "[惊恐]": "😱",
  "[流泪]": "😭",
  "[亲]": "😙",
  "[呆]": "😳",
  "[哀伤]": "😞",
  "[呲牙]": "😁",
  "[吐舌]": "😝",
  "[撇嘴]": "😒",
  "[怒]": "😡",
  "[奸笑]": "😉",
  "[汗]": "😓",
  "[痛苦]": "😖",
  "[惶恐]": "😰",
  "[生病]": "😨",
  "[口罩]": "😷",
  "[大哭]": "😂",
  "[晕]": "😫",
  "[发怒]": "😈",
  "[开心]": "😀",
  "[鬼脸]": "😜",
  "[皱眉]": "😔",
  "[流感]": "🤧",
  "[爱心]": "💖",
  "[心碎]": "💔",
  "[钟情]": "💘",
  "[星星]": "🌟",
  "[生气]": "💢",
  "[便便]": "💩",
  "[强]": "👍",
  "[弱]": "👎",
  "[拜]": "🙏",
  "[牵手]": "👫",
  "[跳舞]": "👯",
  "[禁止]": "🙅‍♀️",
  "[这边]": "🙋‍♀️",
  "[爱意]": "💏",
  "[示爱]": "👩‍❤️‍👩",
  "[嘴唇]": "👄",
  "[狗]": "🐨",
  "[猫]": "🐱",
  "[猪]": "🐷",
  "[兔子]": "🐰",
  "[小鸡]": "🐤",
  "[公鸡]": "🐔",
  "[幽灵]": "👻",
  "[圣诞]": "🎅",
  "[外星]": "👽",
  "[钻石]": "💎",
  "[男孩]": "👦",
  "[女孩]": "👧",
  "[蛋糕]": "🎂",
  "[18]": "🔞",
  "[圈]": "⭕️",
  "[叉]": "❌"
};

export function convertChars2Emoji(str) {
  if (!str) {
    return "";
  }
  return str.replace(
    new RegExp(
      Object.keys(CHAR2EMOJI)
        .join("|")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]"),
      "g"
    ),
    key => CHAR2EMOJI[key]
  );
}
