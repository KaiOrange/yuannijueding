<template>
  <div class="lyric">
    <p 
      v-for="(item, index) in testArray"
      :key="index">{{item}}</p>
  </div>
</template>

<script>
export default {
  name: 'Lyric',
  props: {
    text: String
  },
  computed: {
    testArray() {
      if(!this.text){
        return [];
      } else {
        return this.text.split(" ");
      }
    }
  },
}
</script>

<style scoped lang="scss">
  .lyric{
    position: fixed;
    bottom: 8vh;
    text-align: right;
    left: 0;
    right: 0;
    padding: 0 5vw;
    z-index: 10px;
    color:springgreen;
    font-weight: bold;
    font-size: 20px;

    p {
      margin: 0;
      &:first-of-type {
        text-align: left;
      }
      &:nth-of-type(2):nth-last-of-type(2){
        text-align: center;
      }
    }
  }
</style>
