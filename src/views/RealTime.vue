<template>
  <div id="guide" style="margin: 0 auto;" v-if="guide">
    <div style="text-align: center;">
      <n-gradient-text type="info">
        <h1>实时采集</h1>
      </n-gradient-text>
    </div>
    <div style="text-align: center;">
      <n-button class="button" color="#0a0eff" @click="connect">连接设备</n-button>
      <n-button class="button" color="#0f5a6f" @click="start">开始采集</n-button>
    </div>
  </div>
  <div id="show" v-if="show" class="content">
    <p class="word">标题</p>
    <p class="word">第一行</p>
    <p class="word">第二行</p>
    <p class="word">+</p>
    <p class="word">第四行</p>
    <p class="word">第五行</p>
    <p class="word">按空格继续</p>
  </div>
</template>


<script>
import screenfull from 'screenfull';

export default {
  data() {
    let port = {};
    let recvBuffer = [];
    let stage = 0;

    let guide = true;
    let show = false;
    /**
     * stage 0: 未连接
     * stage 1: 开始并发送 AT+ROLE=0\r\n 等待
     * stage 2: 接收到 +IM_MASTER
     * stage 3: 继续发送 AT+SCAN=1,5 等待
     * stage 4: 接收到扫描数据，等待选择
     * stage 5: 发送 AT+CONN=0,A6C080030009 等待
     */
    return { port, recvBuffer, stage, guide, show };
  },
  methods: {
    str2ascii(str) {
      const ret = [];
      for(const i in str) {
        ret.push(str.codePointAt(i));
      }
      return ret;
    },
    recv2str(recv) {
      const str = [];
      for(const i of recv) {
        str.push(String.fromCodePoint(i));
      }
      return str.join('');
    },
    async sendString(str) {
      if(this.port.writable) {
        const writer = this.port.writable.getWriter();
        const data = new Uint8Array(this.str2ascii(str));
        await writer.write(data);
        console.log(str, data)
        await writer.releaseLock();
      }
    },
    async connect() {
      if(this.stage !== 0) return;
      this.stage = 1;
      console.log('连接设备');
      try {
        this.port = await navigator.serial.requestPort(); // https://wicg.github.io/serial/
        await this.port.open({ baudRate: 115200 });
        await this.sendString('AT+ROLE=0\r\n');

        while(this.port.readable) {
          const reader = this.port.readable.getReader();

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                reader.releaseLock();
                break;
              }
              if (value) {

                for(const i of value) {
                  this.recvBuffer.push(i);
                  // meet \r\n
                  if(this.recvBuffer[this.recvBuffer.length - 2] === 13 && this.recvBuffer[this.recvBuffer.length - 1] === 10) {
                    const recv = this.recv2str(this.recvBuffer);
                    this.recvBuffer = [];
                    console.log(recv);
                    if(recv === '+IM_MASTER\r\n') {
                      this.stage = 2;
                    }
                  }
                }

                if(this.stage === 2) {
                  await this.sendString('AT+SCAN=1,5\r\n');
                  this.stage = 3;
                }
              }
            }
          } catch (err) {
            // read err
            console.error(err);
          }
        }

      } catch (err) {
        console.error(err);
      }
    },
    async start() {
      console.log('开始采集');

      const body = document.body;

      // shift to show
      this.guide = false;
      this.show = true;

      body.setAttribute('style', 'background: #000000; cursor: none;');

      if(screenfull.isEnabled && !screenfull.isFullscreen) {
        screenfull.toggle();
      } else {
        alert('浏览器不支持全屏，请按 F11 手动调整全屏');
      }

      // const keyDown = (event) => {
      //     if(screenfull.isEnabled) {
      //       if(screenfull.isFullscreen) {
      //         body.setAttribute('style', 'background: #000000; cursor: none;');
      //       } else {
      //         body.setAttribute('style', 'background: #ffffff;');
      //       }
      //     }
      //   }

      // window.addEventListener("keydown", keyDown, true); 
      // document.addEventListener("fullscreenchange", keyDown, true);
    }
  },
  mounted() {

  }
}
</script>

<style scoped>
.button {
  margin: 0 10px;
}
.content{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  margin: auto;
}

.word {
  position: relative;
  font-size: 3rem;
  text-align: center;
  color: #ffffff;
}
</style>