<template>
  <div id="app">
    <div class="center" v-if="lineAnimation">
      <div class="line" @animationend="handleLineAnimationEnd"></div>
    </div>
    <div :class="['center', 'center-text']" v-if="lineAnimation">愿你决定</div>
    <img 
      v-for="(item,index) in allImage"
      :key="'img_' + item + '_bg'"
      :src="item"
      :class="['center','main-img-bg',currentImgIndex === index?'active':'' ]" 
      />

    <img 
      v-for="(item,index) in allImage"
      :key="'img_' + item"
      :src="item"
      :class="['center','main-img',currentImgIndex === index?'active':'' ]" 
      />
    
    <img 
      key="img_buy"
      src="/img/buy.gif"
      :class="['center', 'no-transition', 'main-img',currentImgIndex === -2?'active':'' ]" 
      />

    <audio 
      :controls="true" 
      :autoplay="false" 
      :loop="false"
      ref="audio" 
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
    <Lyric :text="text"/>
  </div>
</template>

<script>
import 'normalize.css'
import Lyric from './components/Lyric.vue'
import { convertLrcObject } from './assets/js/utils'
import { allImage } from './assets/assets.json'
allImage.sort(()=>Math.random() - 0.5)

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
      currentTime:-6,
      currentImgIndex:-1,// -2为再见图片
      lineAnimation:false,
      isShowPlayer:false,
      isPlayerInCorner:false,
      isPlaying:false,
      isShowTip:false,
    };
  },
  mounted () {
    setTimeout(() => {
      this.lineAnimation = true;
    }, 200);
    // eslint-disable-next-line no-console
    console.info('源代码：https://github.com/KaiOrange/yuannijueding');
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
    },
    handlePause(){
      this.stopLrcInterval();
      this.isPlaying = false;
    },
    getLrc(cb){
      this.axios.get('/愿你决定.lrc').then((res)=>{
        cb && cb(res.data)
      })
    },
    startLrcInterval(){
      let myAudio = this.$refs.audio
      let imgLength = this.allImage.length
      this.timer = setInterval(()=>{
        //获取当前的播放时间 减去1秒修复了歌词不对应的问题
        var curTime = myAudio.currentTime - 1;
        if (curTime >= 236 && this.currentImgIndex !== -2) {
          this.currentTime = -6;
          this.currentImgIndex = -2;
        } else if (curTime < 236 && Math.abs(this.currentTime - curTime) > 5) {
          this.currentTime = curTime;
          this.currentImgIndex = ++this.currentImgIndex % imgLength
        }
        let lrcs = this.lrcs;
        for (var i = 0; i < lrcs.length; i++) {
          if ((curTime > lrcs[i][0]) && (lrcs[i+1] ? curTime < lrcs[i+1][0] : true)) {
            this.text = lrcs[i][1];
            break;
          }
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
      let classList = Array.from(e.target.classList || [])
      if (classList.indexOf('show') !== -1 && classList.indexOf('playing') === -1) {
        let myAudio = this.$refs.audio;
        if (!myAudio.ended) {
          myAudio.play().catch(()=>{
            this.isShowTip = true
          })
        }
      }
    },
    handleEnded(){
      this.stopLrcInterval();
      this.currentImgIndex = -1;
      this.isPlayerInCorner = false;
      this.isShowTip = true;
    }
  }
}
</script>

<style lang="scss">
body{
  background: #282b32;
  audio{
    float: right;
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
    opacity: 0;
    transition: opacity ease 1s;

    &.active {
      opacity: 1;
    }

    &.no-transition {
      transition: none;
    }
  }
 
  .main-img-bg{
    min-width: 100vw;
    min-height: 100vh;
    opacity: 0;
    transition: opacity ease 1s;
    object-fit: cover;
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
      left: 10vmin;
      top: 10vmin;

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
