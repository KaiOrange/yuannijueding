<template>
  <div class="lyric">
    <p v-for="(item, index) in testArray" :key="index">{{ item }}</p>
  </div>
</template>

<script>
export default {
  name: "Lyric",
  props: {
    text: String
  },
  computed: {
    testArray() {
      if (!this.text) {
        return [];
      } else {
        return this.text.split(" ");
      }
    }
  }
};
</script>

<style scoped lang="scss">
.lyric {
  position: fixed;
  bottom: 6vh;
  text-align: right;
  left: 0;
  right: 0;
  margin: 0 5vw;
  z-index: 10;
  color: #00ff7f;
  font-weight: bold;
  font-size: 20px;
  line-height: 1.4;

  background-image: linear-gradient(
    to right,
    #66ffff 0%,
    #00ff7f 25%,
    #f9c835 50%,
    #00ff7f 75%,
    #66ffff 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: masked-animation 4s linear infinite;

  p {
    margin: 0;
    &:first-of-type {
      text-align: left;
    }
    &:nth-of-type(2):nth-last-of-type(2) {
      text-align: center;
    }
  }
}
@keyframes masked-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
