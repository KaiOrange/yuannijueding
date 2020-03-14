<template>
  <div :class="['img-with-bg', isNoTransition ? 'no-transition' : '']">
    <div
      :style="{ backgroundImage: `url(${url})` }"
      :class="['main-img-bg', isShow ? 'active' : '']"
    ></div>
    <div
      :style="{ backgroundImage: `url(${url})` }"
      :class="['main-img', isShow ? 'active' : '']"
    ></div>
  </div>
</template>

<script>
export default {
  name: "ImgWhisBG",
  props: {
    url: {
      type: String,
      default: ""
    },
    isShow: {
      type: Boolean,
      default: false
    },
    isNoTransition: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="scss">
.img-with-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;

  .main-img-bg {
    position: fixed;
    left: -20px;
    top: -20px;
    right: -20px;
    bottom: -20px;
    opacity: 0;
    transition: opacity ease 1s;
    object-fit: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-size: auto 100%;
    filter: blur(10px);
    overflow: hidden;

    &.active {
      opacity: 0.8;
    }
  }

  .main-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
  }

  &.no-transition {
    .main-img-bg {
      transition: none;
    }
    .main-img {
      transition: none;
    }
  }
}

@media screen and (min-width: 970px) {
  .img-with-bg {
    .main-img-bg {
      background-repeat: repeat;
      background-size: 100% auto;
    }
  }
}
</style>
