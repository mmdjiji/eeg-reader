<template>
  <div style="text-align: center;">
    <div>
      <n-gradient-text type="info">
        <h1>EEGreader - Index</h1>
      </n-gradient-text>
    </div>
    <n-button class="button" color="#8a2be2" @click="readEEG">读取EEG文件</n-button>
    <n-button class="button" color="#3050fd" @click="bigFive">大五人格测试</n-button>
    <n-button class="button" color="#ff69b4" @click="test">按钮</n-button>

    <EEGViewer />
  </div>
</template>

<script>

import { getData } from '../eeg.js';

import EEGViewer from '@/components/EEGViewer.vue';

export default {
  data() {
    const input = document.createElement('input');
    input.type = 'file';
    return {
      input
    }
  },
  methods: {
    readEEG() {
      this.input.click();
    },
    bigFive() {
      this.$router.push('/bigFive');
    },
    test() {
      location.href = 'https://mmdjiji.com';
    }
  },
  mounted() {
    this.input.onchange = () => {
      const file = this.input.files[0];
      const data = { ch1: [], ch2: [] };
      if(!!file) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          // console.log(e.target.result);
          const arrayBuffer = e.target.result;
          const dataView = new DataView(arrayBuffer);
          const length = arrayBuffer.byteLength;
          let buffer = [];
          for(let i = 0; i < length; ++i) {
            buffer.push(dataView.getUint8(i));
          }
          console.log(buffer);
          let goodData = 0, badData = 0;
          for(let i = 0; i < length; ++i) {
            if(buffer[i] === 170 && buffer[i+1] === 170 && buffer[i+2] === 131) {
              const temp = getData(buffer.slice(i, i+104));
              if(temp) {
                for(let j of temp.ch1) {
                  data.ch1.push(j);
                }
                for(let j of temp.ch2) {
                  data.ch2.push(j);
                }
                ++goodData;
              } else {
                ++badData;
              }
            }
          }
          console.log('data:', data);
          console.log('goodData:', goodData);
          console.log('badData:', badData);
          window.eegViewer.setData(data);
        }
      }
    }
  },
  components: {
    EEGViewer
  }
}
</script>

<style scoped>
.button {
  margin: 0 10px;
}
</style>