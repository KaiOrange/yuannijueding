<template>
  <div id="app">
    <div class="center" v-if="lineAnimation">
      <div class="line" @animationend="handleLineAnimationEnd"></div>
    </div>
    <div :class="['center', 'center-text']" v-if="lineAnimation">愿你决定</div>
    <div 
      v-for="(item,index) in allImage"
      :key="'img_' + item + '_bg'"
      :style="{backgroundImage:`url(${item})`}"
      :class="['center','main-img-bg',currentImgIndex === index?'active':'' ]" 
      />

    <div 
      v-for="(item,index) in allImage"
      :key="'img_' + item"
      :style="{backgroundImage:`url(${item})`}"
      :class="['center','main-img',currentImgIndex === index?'active':'' ]" 
      />

    <video 
      :loop="false" 
      :controls="false" 
      :muted="true"
      :autoplay="false"
      :preload="true"
      :class="['center', 'no-transition', 'main-img',currentImgIndex === -2?'active':'' ]" 
      ref="buyVideo"
      >
      <source src="/buy.mp4" type="video/mp4">
    </video>

    <audio 
      :controls="true" 
      :autoplay="false" 
      :loop="false"
      ref="audio" 
      class="center audio"
      @play="handlePlay" 
      @pause="handlePause"
      @ended="handleEnded">
      <source src="/愿你决定.mp3" type="audio/mpeg" autoplay preload="auto">
      Your browser does not support the audio element.
    </audio>

    <div 
      :class="['center','player',isShowPlayer?'show':'',isPlayerInCorner?'corner':'']"
      @click="handlePlayerClick"
      @transitionend="handlePlayerShow"
      >
        <img :class="isPlaying?'playing':''" src="/img/player.jpeg"/>
    </div>

    <div :class="['center', 'tip',isShowTip?'showTip':'']">请点击上方图片以播放音乐</div>

    <div v-if="!isCommentsDisabled">
      <div 
        v-for="(item,index) in comments"
        :key="'comment_' + item.commentId"
        :class="['comment', currentImgIndex > index? 'activated' : currentImgIndex === index?'active':'' ]">
        <div>{{item.content}}</div>
        <div>—— {{item.user.nickname}}</div>
      </div>
    </div>

    <div :class="['btn-comment', 
      isPlayerInCorner && comments.length > 0 ? 'show' : '', 
      isCommentsDisabled ? 'disabled' : '']" 
      @click="toggleCommentsDisabled">评</div>

    <Lyric :text="text"/>
  </div>
</template>

<script>
import 'normalize.css'
import Lyric from './components/Lyric.vue'
import { convertLrcObject } from './assets/js/utils'
import { allImage } from './assets/assets.json'
import NoSleep from 'nosleep.js'
// 打乱并且显示钱29张 歌曲最多支持29张图片
const NEEDIMGLENGTH = 29;
allImage.sort(()=>Math.random() - 0.5).splice(NEEDIMGLENGTH);

var noSleep = new NoSleep();
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleep.enable();
}, false);

export default {
  name: 'app',
  components: {
    Lyric
  },
  data: function() {
    return {
      text:'',
      timer:null,
      allImage:allImage,
      lrcs:null,
      currentImgIndex:-1,// -2为再见图片
      lineAnimation:false,
      isShowPlayer:false,
      isPlayerInCorner:false,
      isPlaying:false,
      isShowTip:false,
      isCommentsDisabled: localStorage.getItem('isCommentsDisabled') !== 'false',
      comments:[]
    };
  },
  mounted () {
    setTimeout(() => {
      this.lineAnimation = true;
    }, 200);
    // eslint-disable-next-line no-console
    console.info('源代码：https://github.com/KaiOrange/yuannijueding');

    // 已废弃需要收费的API：http://musicapi.leanapp.cn/comment/music?id=187408
    this.axios.get('https://api.imjad.cn/cloudmusic/?id=187408',{
      params: {
        limit: 50,
        offset: 0,
        type:'comments'
      },
      changeOrigin:true,
    }).then((res)=>{
      // 去掉回复别人的评论
      let toComments = []
      let comments = (res.data.comments || []).filter(item=>{
        if (item.beReplied && item.beReplied.length > 0) {
          toComments.push(item)
          return false;
        }
        return true;
      })
      this.comments = comments.length >= NEEDIMGLENGTH ? 
        comments.splice(0,NEEDIMGLENGTH) : 
        comments.concat(toComments.splice(0,NEEDIMGLENGTH - comments.length))
    })
  },
  beforeDestroy() {
    this.stopLrcInterval();
  },
  methods: {
    handlePlayerClick(){
      let audio = this.$refs.audio;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    },
    handlePlay(){
      this.isPlaying = true;
      this.isPlayerInCorner = true;
      this.isShowTip = false;
      if (!this.lrcs) {
        this.getLrc((data)=>{
          this.lrcs = convertLrcObject(data);
          this.startLrcInterval();
        })
      } else {
        this.startLrcInterval();
      }
      let buyVideo = this.$refs.buyVideo;
      if (buyVideo && buyVideo.paused && buyVideo.currentTime !== 0) {
        buyVideo.play();
      }
    },
    handlePause(){
      this.stopLrcInterval();
      this.isPlaying = false;
      let buyVideo = this.$refs.buyVideo;
      if (buyVideo && !buyVideo.paused) {
        buyVideo.pause();
      }
    },
    getLrc(cb){
      this.axios.get('/愿你决定.lrc').then((res)=>{
        cb && cb(res.data)
      })
    },
    startLrcInterval(){
      let myAudio = this.$refs.audio;
      let imgLength = this.allImage.length;
      let oldText = null;
      let buyVideoTime = 235;
      this.timer = setInterval(()=>{
        // 获取当前的播放时间 减去1秒修复了歌词不对应的问题
        var curTime = myAudio.currentTime - 1;
        let lrcs = this.lrcs;

        for (var i = 0; i < lrcs.length; i++) {
          if ((curTime > lrcs[i][0]) && (lrcs[i+1] ? curTime < lrcs[i+1][0] : true)) {
            this.text = lrcs[i][1];
            break;
          }
        }
        if (curTime >= buyVideoTime && this.currentImgIndex !== -2) {
          this.currentTime = -6;
          this.currentImgIndex = -2;
          let buyVideo = this.$refs.buyVideo;
          if (buyVideo) {
            buyVideo.currentTime = 0;
            buyVideo.play();
          }
        } else if (curTime < buyVideoTime && oldText !== this.text && this.text.trim()) {
          oldText = this.text
          this.currentImgIndex = ++this.currentImgIndex % imgLength
        }
      }, 200);
    },
    stopLrcInterval(){
      if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    handleLineAnimationEnd(){
      this.isShowPlayer = true;
    },
    handlePlayerShow(e){
      let classList = Array.from(e.target.classList || []);
      if (classList.indexOf('show') !== -1 && classList.indexOf('playing') === -1) {
        let myAudio = this.$refs.audio;
        if (!myAudio.ended) {
          myAudio.play().catch(()=>{
            this.isShowTip = true;
          })
        } else {
          let buyVideo = this.$refs.buyVideo;
          if (buyVideo) {
            buyVideo.currentTime = 0;
            buyVideo.pause();
          }
        }
      }
    },
    handleEnded(){
      this.stopLrcInterval();
      this.currentImgIndex = -1;
      this.isPlayerInCorner = false;
      this.isShowTip = true;
    },
    toggleCommentsDisabled(){
      this.isCommentsDisabled = !this.isCommentsDisabled;
      localStorage.setItem('isCommentsDisabled', this.isCommentsDisabled + '');
    }
  }
}
</script>

<style lang="scss">
body{
  background: #282b32;
  overflow: hidden;
  .audio {
    top: 30%;
    display: none;
  }
}
.center{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
  
  .main-img{
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity ease 1s;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% auto;

    &.active {
      opacity: 1;
    }

    &.no-transition {
      transition: none;
    }
  }
 
  .main-img-bg{
    width: 100vw;
    height: 100vh;
    opacity: 0;
    transition: opacity ease 1s;
    object-fit: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-size: auto 100%;
    filter: blur(10px);

    &.active {
      opacity: .8;
    }
  }

  .line{
      width: 2px;
      height: 100%;
      background: #ffffff;
      animation: line-animation linear 5s forwards;
      position: relative;
  }

  .center-text{
    font-size: 40px;
    font-weight: bold;
    animation: text-animation linear 5s forwards;
    opacity: 0;
  }

  .player{
    width: 0;
    height: 0;
    border-radius: 50%;
    overflow: hidden;
    transition: all ease 1s;
    transform-origin: center;

    &.show{
      width: 70vmin;
      height: 70vmin;
    }

    &.corner{
      width: 14vmin;
      height: 14vmin;
      margin: 10vmin;
      left: 0;
      top: 0;

      img{
        animation: rotate linear 5s infinite;
        animation-play-state: paused;
      }
    }
    
    

    img{
      width: 100%;
      height: 100%;

      &.playing{
        animation-play-state: running;
      }
    }
  }

  .tip{
    top:calc(50% + 47vmin);
    font-size: 14px;
    font-weight: 500;
    animation: brightness ease-in-out 1.4s infinite;
    opacity: 0;
    transition: all ease 1s;

    &.showTip{
      opacity: 1;
    }
  }

  .comment {
    position: fixed;
    top: 0;
    right: 0;
    padding-top: 3vmin;
    padding-right: 3vmin;
    text-align: right;
    max-width: 77vmin;
    font-size: 13px;
    line-height: 1.4;
    transform: translate(100%,0);
    opacity: 0;
    transition: all ease .4s;

    div:first-child {
      display: inline-block;
      text-align: left;
    }

    &.active{
      transform: translate(0,0);
      opacity: 1;
    }
    
    &.activated{
      transform: translate(0,-100%);
    }
  }

  .btn-comment { 
    position: absolute;
    top:20vmin;
    left:10vmin;
    width: 7vmin;
    height: 7vmin;
    line-height: 7vmin;
    text-align: center;
    transform: translateX(-50%);
    font-size: 16px;
    font-weight: bold;
    border: 2px solid #ffffff;
    border-radius: 50%;
    opacity: 0;
    transition: all ease .5s .5s;

    &.disabled{
      &::after{
        content: '';
        display: block;
        width: 100%;
        height: 2px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%) rotate(-45deg);
        background: currentColor;
      }
    }

    &.show {
      opacity: 1;
    }
  }
}

@keyframes line-animation {
  18% {
    height: 100vmax;
  }
  36%{
    height: 100vmax;
    transform: rotate(90deg);
  }
  37%{
    height: 100vw;
    transform: rotate(90deg);
  }
  50%{
    height: 70vw;
    transform: rotate(90deg);
  }
  
  60%{
    height: 70vw;
    transform: translate(0%, 30px) rotate(90deg);
  }
  
  90%{
    height: 70vw;
    transform: translate(0%, 30px) rotate(90deg);
    left:50%;
  }

  99%{
    height: 70vw;
    transform: translate(0%, 30px) rotate(90deg);
    left:150vw;
    display: block;
  }
  100%{
    height: 70vw;
    transform: translate(0%, 30px) rotate(90deg);
    left:150vw;
    display: none;
  }
}

@keyframes text-animation {
  
  55%{
    opacity: 0;
  }

  70%{
    opacity: 1;
  }
  
  90%{
    opacity: 1;
    left:50%;
  }

  99%{
    opacity: 1;
    left:-50vw;
    display: block;
  }

  100%{
    opacity: 1;
    left:-50vw;
    display: none;
  }
}

@keyframes rotate {
  form {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes brightness {
  form {
    color: #eeeeee;
  }
  50% {
    color: #aaaaaa;
  }
  to {
    color: #eeeeee;
  }
}
</style>
