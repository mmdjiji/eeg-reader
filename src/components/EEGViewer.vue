<template>
  <div id="main"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  mounted() {
    // Object.defineProperty(document.getElementById('main'), 'clientWidth', { get: () => this?.width || 640 });
    // Object.defineProperty(document.getElementById('main'), 'clientHeight', { get: () => this?.height || 480 });

    const eegViewer = echarts.init(document.getElementById('main'));
    eegViewer.setData = ({ ch1, ch2 }) => {
      const axis = [];
      for(const i in ch1) {
        axis.push(i);
      }
      eegViewer.setOption({
        xAxis: {
          data: axis
        },
        yAxis: {},
        series: [
          {
            data: ch1,
            type: 'line',
            emphasis: {
              label: {
                show: true
              }
            },
            label: {
              show: false,
              position: 'top',
              fontSize: 20
            }
          },
          {
            data: ch2,
            type: 'line',
            emphasis: {
              label: {
                show: true
              }
            },
            label: {
              show: false,
              position: 'top',
              fontSize: 20
            }
          }
        ],
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
          }
        }
      });
    }
    window.eegViewer = eegViewer;
    window.onresize = () => {
      eegViewer.resize();
    };
  }
}
</script>

<style scoped>
  #main,
  html,
  body {
    width: 100%;
  }
  #main {
    height: 800px;
  }
</style>