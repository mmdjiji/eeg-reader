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
    <p class="word">{{ ctx[0] }}</p>
    <p class="word">{{ ctx[1] }}</p>
    <p class="word">{{ ctx[2] }}</p>
    <p class="word">{{ ctx[3] }}</p>
    <p class="word">{{ ctx[4] }}</p>
    <p class="word">{{ ctx[5] }}</p>
    <p class="word">{{ ctx[6] }}</p>
  </div>
</template>


<script>
import screenfull from 'screenfull';

export default {
  data() {
    let port = {};
    let recvBuffer = [];
    let stage = 0;
    /**
     * stage 0: 未连接
     * stage 1: 开始并发送 AT+ROLE=0\r\n 等待
     * stage 2: 接收到 +IM_MASTER
     * stage 3: 继续发送 AT+SCAN=1,5 等待
     * stage 4: 接收到扫描数据，等待选择
     * stage 5: 发送 AT+CONN=0,A6C080030009 等待
     */

    let guide = true;
    let show = false;

    let ctx = ['　', '　', '　', '　', '　', '　', '　'];

    return { port, recvBuffer, stage, guide, show, ctx };
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
    async sleep(seconds) {
      return new Promise((resolve) => setTimeout(resolve, seconds));
    },
    async setLine(line, ctx) {
      this.ctx[line] = ctx;
    },
    async clearLine(line) {
      this.ctx[line] = '　';
    },
    async waitKey(code) {
      const startTime = Date.now();
      return new Promise((resolve, reject) => {
        const keyDown = (event) => {
          if(code === event.code) {
            window.removeEventListener("keydown", keyDown, true);
            const endTime = Date.now();
            resolve(endTime - startTime);
          }
        }
        window.addEventListener("keydown", keyDown, true);
      });
    },
    async execute() {
      await this.sleep(1000);
      await this.setLine(3, '请注视中心');
      await this.sleep(3000);
      await this.setLine(3, '+');
      await this.sleep(3000);
      await this.setLine(3, '好的，现在测试一下按空格');
      const t1 = await this.waitKey('Space');
      await this.setLine(3, `你按下了空格，用时${t1}毫秒`);
      const t2 = await this.waitKey('Space');
      await this.setLine(3, `你又按下了一次空格，用时${t2}毫秒`);
      const t3 = await this.waitKey('Space');
      await this.setLine(3, `你又又又按下了N次空格，用时${t3}毫秒`);
      await this.sleep(3000);
      await this.setLine(3, '实验结束，好耶');
      
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
            console.error(err);
          }
        }

      } catch (err) {
        console.error(err);
      }
    },
    async start() {
      // shift to show
      this.guide = false;
      this.show = true;
      document.body.setAttribute('style', 'background: #000000; cursor: none;');

      if(screenfull.isEnabled && !screenfull.isFullscreen) {
        screenfull.toggle();
      } else {
        alert('浏览器不支持全屏，请按 F11 手动调整全屏');
      }

      // play execute
      await this.execute();
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