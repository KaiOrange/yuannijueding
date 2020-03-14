<template>
  <div id="app">
    <div class="center" v-if="lineAnimation">
      <div class="line" @animationend="handleLineAnimationEnd"></div>
    </div>

    <div :class="['center', 'center-text']" v-if="lineAnimation">愿你决定</div>

    <template v-for="(item, index) in playingImages">
      <ImgWithBG
        :key="'img_' + item"
        v-show="currentImgIndex + 5 > index"
        :url="item"
        :isShow="currentImgIndex === index"
        :isNoTransition="currentImgIndex === -2"
      />
    </template>

    <video
      :loop="false"
      :controls="false"
      :muted="true"
      :autoplay="false"
      :preload="true"
      :class="['center', 'buy-video', currentImgIndex === -2 ? 'active' : '']"
      ref="buyVideo"
    >
      <source :src="`${CDNURL}/buy.mp4`" type="video/mp4" />
    </video>

    <div v-if="!isCommentsDisabled">
      <div
        v-for="(item, index) in comments"
        :key="'comment_' + item.commentId"
        :class="[
          'comment',
          currentImgIndex > index
            ? 'activated'
            : currentImgIndex === index
            ? 'active'
            : ''
        ]"
      >
        <div>{{ item.content }}</div>
        <div>—— {{ item.user.nickname }}</div>
      </div>
    </div>

    <Lyric :text="text" />

    <div id="particles-js" :class="[isPlayerInCorner ? 'show' : '']"></div>

    <audio
      :controls="true"
      :autoplay="false"
      :loop="false"
      ref="audio"
      class="center audio"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
    >
      <source
        :src="`${CDNURL}/愿你决定.mp3`"
        type="audio/mpeg"
        autoplay
        preload="auto"
      />
      Your browser does not support the audio element.
    </audio>

    <div
      :class="[
        'center',
        'player',
        isShowPlayer ? 'show' : '',
        isPlayerInCorner ? 'corner' : ''
      ]"
      @click="handlePlayerClick"
      @transitionend="handlePlayerShow"
    >
      <img
        :class="isPlaying ? 'playing' : ''"
        :src="`${CDNURL}/img/player.jpeg`"
      />
    </div>

    <div :class="['center', 'tip', isShowTip ? 'showTip' : '']">
      请点击上方图片以播放音乐
    </div>

    <div
      :class="[
        'btn-comment',
        isPlayerInCorner && comments.length > 0 ? 'show' : '',
        isCommentsDisabled ? 'disabled' : ''
      ]"
      @click="toggleCommentsDisabled"
    >
      评
    </div>
  </div>
</template>

<script>
import "normalize.css";
import Lyric from "./components/Lyric.vue";
import ImgWithBG from "./components/ImgWithBG.vue";
import { convertLrcObject, convertChars2Emoji } from "./assets/js/utils";
import { allImages } from "./assets/assets.json";
import NoSleep from "nosleep.js";
import "particles.js";

export default {
  name: "app",
  components: {
    Lyric,
    ImgWithBG
  },
  data: function() {
    return {
      text: "",
      timer: null,
      allImages: [],
      playingImages: [], //正在播放的图片
      lrcs: null,
      currentImgIndex: -3, // -2为再见图片 -1是初始化的值
      lineAnimation: false,
      isShowPlayer: false,
      isPlayerInCorner: false,
      isPlaying: false,
      isShowTip: false,
      isCommentsDisabled: localStorage.getItem("isCommentsDisabled") === "true",
      comments: [],
      CDNURL: this.$store.state.CDNURL
    };
  },
  mounted() {
    // 防止屏幕熄灭
    var noSleep = new NoSleep();
    document.addEventListener(
      "click",
      function enableNoSleep() {
        document.removeEventListener("click", enableNoSleep, false);
        noSleep.enable();
      },
      false
    );
    window.particlesJS.load("particles-js", "particlesjs-config.json");

    setTimeout(() => {
      this.lineAnimation = true;
    }, 200);
    // eslint-disable-next-line no-console
    console.info("源代码：https://github.com/KaiOrange/yuannijueding");

    // 打乱图片的顺序 取其前29张 然后使用CDN
    this.allImages = allImages
      .sort(() => Math.random() - 0.5)
      .map(item => this.CDNURL + item);

    // 计算一下playingImages
    this.currentImgIndex = -1;

    // 已废弃需要收费的API：http://musicapi.leanapp.cn/comment/music?id=187408
    this.axios
      .get("https://api.imjad.cn/cloudmusic/?id=187408", {
        params: {
          limit: 50,
          offset: 0,
          type: "comments"
        },
        changeOrigin: true
      })
      .then(res => {
        // 去掉回复别人的评论
        let toComments = [];
        this.comments = (res.data.comments || [])
          .filter(item => {
            if (item.beReplied && item.beReplied.length > 0) {
              toComments.push(item);
              return false;
            }
            return true;
          })
          .map(item => {
            item.content = convertChars2Emoji(item.content);
            return item;
          });
      });

    // 页面加载完后首先加载一下歌词
    this.getLrc(data => {
      this.lrcs = convertLrcObject(data);
    });
  },
  watch: {
    currentImgIndex(newValue) {
      let cacheImgSize = 4; // 最多缓存数量
      if (this.playingImages.length >= newValue + cacheImgSize) {
        return;
      } else if (this.playingImages.length === this.allImages.length) {
        return;
      } else {
        this.playingImages = this.allImages.slice(
          0,
          Math.min(newValue + cacheImgSize, this.allImages.length)
        );
      }
    }
  },
  beforeDestroy() {
    this.stopLrcInterval();
  },
  methods: {
    handlePlayerClick() {
      let audio = this.$refs.audio;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    },
    handlePlay() {
      this.isPlaying = true;
      this.isPlayerInCorner = true;
      this.isShowTip = false;
      if (!this.lrcs) {
        // 防止歌词没有加载完 再次调用一下
        this.getLrc(data => {
          this.lrcs = convertLrcObject(data);
          if (!this.timer) {
            this.startLrcInterval();
          }
        });
      } else if (!this.timer) {
        this.startLrcInterval();
      }
      let buyVideo = this.$refs.buyVideo;
      if (buyVideo && buyVideo.paused && buyVideo.currentTime !== 0) {
        buyVideo.play();
      }
    },
    handlePause() {
      this.isPlaying = false;
      let buyVideo = this.$refs.buyVideo;
      if (buyVideo && !buyVideo.paused) {
        buyVideo.pause();
      }
    },
    getLrc(cb) {
      this.axios.get("/愿你决定.lrc").then(res => {
        cb && cb(res.data);
      });
    },
    startLrcInterval() {
      let myAudio = this.$refs.audio;
      let imgLength = this.allImages.length;
      let thisIndex = -1;
      let oldIndex = thisIndex;
      let buyVideoTime = 235;
      this.timer = setInterval(() => {
        // 暂停的时候就不管了
        if (!this.isPlaying) {
          return;
        }
        // 获取当前的播放时间 减去1秒修复了歌词不对应的问题
        var curTime = myAudio.currentTime - 1;
        let lrcs = this.lrcs;

        for (var i = 0; i < lrcs.length; i++) {
          if (
            curTime > lrcs[i][0] &&
            (lrcs[i + 1] ? curTime < lrcs[i + 1][0] : true)
          ) {
            this.text = lrcs[i][1];
            thisIndex = i;
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
        } else if (curTime < buyVideoTime && oldIndex !== thisIndex) {
          oldIndex = thisIndex;
          this.currentImgIndex = ++this.currentImgIndex % imgLength;
        }
      }, 200);
    },
    stopLrcInterval() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    handleLineAnimationEnd() {
      this.isShowPlayer = true;
    },
    handlePlayerShow(e) {
      let classList = Array.from(e.target.classList || []);
      if (
        classList.indexOf("show") !== -1 &&
        classList.indexOf("playing") === -1
      ) {
        let myAudio = this.$refs.audio;
        if (!myAudio.ended) {
          myAudio.play().catch(() => {
            this.isShowTip = true;
          });
        } else {
          let buyVideo = this.$refs.buyVideo;
          if (buyVideo) {
            buyVideo.currentTime = 0;
            buyVideo.pause();
          }
        }
      }
    },
    handleEnded() {
      this.stopLrcInterval();
      this.currentImgIndex = -1;
      this.isPlayerInCorner = false;
      this.isShowTip = true;
    },
    toggleCommentsDisabled() {
      this.isCommentsDisabled = !this.isCommentsDisabled;
      localStorage.setItem("isCommentsDisabled", this.isCommentsDisabled + "");
    }
  }
};
</script>

<style lang="scss">
html {
  background: #282b32;
  overflow: hidden;

  body {
    min-height: 100vh;
    position: relative;
    overflow: hidden;

    .audio {
      top: 30%;
      display: none;
    }
  }
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;

  #particles-js {
    opacity: 0;
    transition: opacity ease-out 0.8s;

    &.show {
      opacity: 1;
    }
  }

  .buy-video {
    width: 100%;
    opacity: 0;

    &.active {
      opacity: 1;
    }
  }

  .line {
    width: 2px;
    height: 100%;
    background: #ffffff;
    animation: line-animation linear 5s forwards;
    position: relative;
  }

  .center-text {
    font-size: 40px;
    font-weight: bold;
    animation: text-animation linear 5s forwards;
    opacity: 0;
  }

  .player {
    width: 0;
    height: 0;
    border-radius: 50%;
    overflow: hidden;
    transition: all ease 1s;
    transform-origin: center;

    &.show {
      width: 7rem;
      height: 7rem;
    }

    &.corner {
      width: 60px;
      height: 60px;
      left: 45px;
      top: 45px;

      img {
        animation: rotate linear 5s infinite;
        animation-play-state: paused;
      }
    }

    img {
      width: 100%;
      height: 100%;
      display: block;

      &.playing {
        animation-play-state: running;
      }
    }
  }

  .tip {
    top: calc(50% + 47vmin);
    font-size: 14px;
    font-weight: 500;
    animation: brightness ease-in-out 1.4s infinite;
    opacity: 0;
    transition: all ease 1s;

    &.showTip {
      opacity: 1;
    }
  }

  .comment {
    color: #eeeeee;
    position: absolute;
    top: 0;
    right: 0;
    padding-top: 15px;
    padding-right: 15px;
    text-align: right;
    max-width: calc(10rem - 90px);
    box-sizing: border-box;
    font-size: 13px;
    line-height: 1.4;
    transform: translate(100%, 0);
    opacity: 0;
    transition: all ease 0.4s;

    div:first-child {
      display: inline-block;
      text-align: left;
    }

    &.active {
      transform: translate(0, 0);
      opacity: 1;
    }

    &.activated {
      transform: translate(0, -100%);
    }
  }

  .btn-comment {
    position: absolute;
    top: 90px;
    left: 45px;
    width: 34px;
    height: 34px;
    line-height: 36px;
    text-align: center;
    transform: translateX(-50%);
    font-size: 16px;
    font-weight: bold;
    border: 2px solid #ffffff;
    border-radius: 50%;
    opacity: 0;
    transition: all ease 0.5s 0.5s;

    &.disabled {
      &::after {
        content: "";
        display: block;
        width: 100%;
        height: 2px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
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
    height: 10rem;
  }
  36% {
    height: 10rem;
    transform: rotate(90deg);
  }
  37% {
    height: 10rem;
    transform: rotate(90deg);
  }
  50% {
    height: 7rem;
    transform: rotate(90deg);
  }

  60% {
    height: 7rem;
    transform: translate(0%, 30px) rotate(90deg);
  }

  90% {
    height: 7rem;
    transform: translate(0%, 30px) rotate(90deg);
    left: 50%;
  }

  99% {
    height: 7rem;
    transform: translate(0%, 30px) rotate(90deg);
    left: 15rem;
    display: block;
  }
  100% {
    height: 7rem;
    transform: translate(0%, 30px) rotate(90deg);
    left: 15rem;
    display: none;
  }
}

@keyframes text-animation {
  55% {
    opacity: 0;
  }

  70% {
    opacity: 1;
  }

  90% {
    opacity: 1;
    left: 50%;
  }

  99% {
    opacity: 1;
    left: -5rem;
    display: block;
  }

  100% {
    opacity: 1;
    left: -5rem;
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
