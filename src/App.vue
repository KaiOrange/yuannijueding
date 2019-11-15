<template>
  <div id="app">
    <audio controls="controls" ref="audio">
      <source src="./assets/愿你决定.mp3" type="audio/mpeg" autoplay preload="auto">
      Your browser does not support the audio element.
    </audio>
    <div>{{text}}</div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import { convertLrcObject } from './assets/js/utils'

export default {
  name: 'app',
  components: {
    // HelloWorld
  },
  data: function() {
    return {
      text:''
    };
  },
  mounted () {
    let myAudio = this.$refs.audio
    var audioPlay = myAudio.play();
    audioPlay.then(function () {
        console.log('可以自动播放');
    }).catch(function (err) {
        console.log(err);
    })
    this.axios.get('/愿你决定.lrc').then((res)=>{
      let lrcs = convertLrcObject(res.data);
      // myAudio.play();
      setInterval(()=>{
        var curTime = myAudio.currentTime;//获取当前的播放时间
        for (var i = 0; i < lrcs.length; i++) {
          if ((curTime >lrcs[i][0])&&(curTime<lrcs[i+1][0])) {
            this.text = lrcs[i][1];
            break;
          }
        }
      }, 200);
    })
  },
  methods: {
    handleClick(){
      // this.$refs.audio.play();
    }
  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
