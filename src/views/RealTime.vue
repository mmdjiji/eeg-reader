<template>
  <div style="margin: 0 auto;">
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
</template>


<script>
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
    return { port, recvBuffer, stage };
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
</style>