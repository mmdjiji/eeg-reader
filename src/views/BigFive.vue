<template>
  <div style="margin: 0 auto;">
    <div style="text-align: center;">
      <n-gradient-text type="info">
        <h1>大五人格测试</h1>
      </n-gradient-text>
      <!-- <div style="margin-bottom: 1rem;">
        <span>服务器：</span>
        <n-popselect
          v-model:value="model_value"
          :options="model_options"
          size="medium"
          scrollable
        >
          <n-button class="button" color="#882c15" style="margin-right: 8px">
            {{ model_value || '选择服务器' }}
          </n-button>
        </n-popselect>
      </div> -->
      <n-alert title="什么是大五人格？" type="info" style="width: 600px; margin: 0 auto;">
        五大性格特质（Big Five personality traits），又叫「五因素模型」或「大五人格模型」，是目前公认比较全面的人格分析模型，通过大五人格量表（The Big Five）进行测量。近年来，研究者们在人格描述模式上形成了比较一致的共识，提出了人格的大五模式， Goldberg（1992）把它称之为人格心理学中的一场革命，研究者通过词汇学的方法，发现大约有五种特质可以涵盖人格描述的所有方面。 大五人格（OCEAN），也被称之为人格的海洋，它们分别是：

        <li>开放性（Openness）：指个体对经验持开放、探求的态度。</li>
        <li>尽责性（Conscientiousness）：指个体在目标导向行为上的组织、坚持和动机。</li>
        <li>外向性（Extraversion）：指个体对外部世界的积极投入程度。</li>
        <li>宜人性（Agreeableness）：指个体在合作与社会和谐性方面的差异。</li>
        <li>神经质（Neuroticism）：指个体体验消极情绪的倾向。</li>
        <a target="_blank" href="https://www.xmcs.cn/x/dwrg60">NEO-60</a>&nbsp;
        <a target="_blank" href="https://www.xmcs.cn/x/dwrg240">NEO-240</a>
      </n-alert>
    </div>
    
    <n-timeline horizontal style="margin-top: 1rem; justify-content: center;">
      <n-timeline-item
        type="success"
        title="采集数据"
        content="取得EEG文件"
      />
      <n-timeline-item
        type="info"
        title="分析数据"
        content="上传EEG文件"
      />
      <n-timeline-item
        title="得出结果"
        content="下载分析报告"
      />
    </n-timeline>

    <div style="text-align: center; margin-top: 1rem;">
    <p>
      <span>您只需</span>
      <n-button class="button" color="#8a2be2" @click="readEEG">上传EEG文件</n-button>
      <span>即可开始分析您的数据，得出您的大五人格结果。</span>
    </p>
    </div>
  </div>
</template>


<script>
import { getData } from '../eeg.js';

export default {
  data() {
    const input = document.createElement('input');
    input.type = 'file';

    // let model_value = '';

    // const model_options = [
    //   {
    //     label: 'model:v1',
    //     value: 'http://127.0.0.1:1001'
    //   },
    //   {
    //     label: 'model:v2',
    //     value: 'http://127.0.0.1:1002',
    //     disabled: true
    //   }
    // ];
    return {
      input
    }
  },
  methods: {
    readEEG() {
      this.input.click();
    },
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
        }
      }
    }
  }
}
</script>

<style scoped>
.button {
  margin: 0 10px;
}
</style>