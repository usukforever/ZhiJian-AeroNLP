<template>
  <div class="page-shell fade-in">
    <!-- 左侧：航路查询 -->
    <aside class="side-panel">
      <h1>Routes 模块</h1>
      <p>航路查询与 NOTAM 触发式重规划（Demo）</p>

      <div class="card" style="margin-top:24px">
        <h3>航路查询</h3>

        <label>出发机场</label>
        <select v-model="from">
          <option value="">-- 请选择 --</option>
          <option v-for="airport in airports" :key="airport.code" :value="airport.code">
            {{ airport.code }} {{ airport.name }}
          </option>
        </select>

        <label>到达机场</label>
        <select v-model="to">
          <option value="">-- 请选择 --</option>
          <option v-for="airport in airports" :key="airport.code" :value="airport.code">
            {{ airport.code }} {{ airport.name }}
          </option>
        </select>

        <button style="margin-top:16px" @click="queryRoute" :disabled="!from || !to">
          查询航路
        </button>
      </div>

      <button class="btn btn-primary" @click="goHome">
        <span class="btn-dot" aria-hidden="true"></span>
        返回总览
      </button>

    </aside>

    <!-- 右侧：结果展示 -->
    <main class="main-panel">
      <!-- 基础航路信息 -->
      <div class="card">
        <h2>基础航路信息</h2>
        <p style="margin-bottom:16px">
          <span style="font-size:16px">{{ getAirportName(route.from) }} ({{ route.from }}) → {{ getAirportName(route.to) }} ({{ route.to }})</span>
        </p>
        <p><b>完整航路：</b>{{ route.routeString }}</p>
        <p>
          航向 {{ route.heading }}° ｜ 航路里程 {{ route.distance }} NM ｜ 直飞 {{ route.directDistance }} NM
        </p>
        <p>
          RVSM 建议高度：
          <span v-for="h in route.rvsm" :key="h" class="badge">{{ h }}</span>
        </p>
      </div>

      <!-- NOTAM 与重规划 -->
      <div class="grid-2" style="margin-top:24px">
        <div class="card">
          <h3>NOTAM 实时告警</h3>
          <span class="badge" style="background: rgba(255,77,79,.18); color:#b30000">
            {{ notam.level === 'HIGH' ? '高风险' : notam.level === 'MEDIUM' ? '中风险' : '低风险' }} NOTAM
          </span>
          <p style="margin-top:12px">
            {{ notam.type }} ｜ 影响航段：{{ notam.affectedSegment }}<br />
            时间：{{ notam.timeWindow }}<br />
            {{ notam.description }}
          </p>
        </div>

        <div class="card">
          <h3>系统重规划参考航路</h3>
          <ul>
            <li v-for="plan in reroutes" :key="plan.id" style="margin-bottom:12px">
              <b>{{ plan.title }}</b><br />
              {{ plan.route }}<br />
              影响：{{ plan.delta }} ｜ 推荐度 {{ plan.recommendation }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 地图示意 -->
      <div class="card" style="margin-top:24px">
        <h3>航路示意地图（ECharts · 中国）</h3>
        <div ref="mapRef" style="height:420px"></div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from "vue-router";
import * as echarts from 'echarts'
import { routeTable, airports } from './mock/routes'
import { notamList } from './mock/notam'
import { reroutePlans } from './mock/reroute'

const router = useRouter();
const goHome = () => router.push("/");

const from = ref('')
const to = ref('')

const route = ref(routeTable.ZBAA_ZSPD)
const notam = ref(notamList[0])
const reroutes = ref(reroutePlans)

const mapRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function getAirportName(code: string): string {
  const airport = airports.find(a => a.code === code)
  return airport ? airport.name : code
}

function getAirportCoords(code: string): [number, number] | null {
  const airport = airports.find(a => a.code === code)
  return airport ? [airport.lng, airport.lat] : null
}

function updateMapDisplay() {
  if (!chartInstance || !from.value || !to.value) return
  
  const fromCoords = getAirportCoords(from.value)
  const toCoords = getAirportCoords(to.value)
  
  if (!fromCoords || !toCoords) return
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}'
    },
    geo: {
      map: 'china',
      roam: true,
      itemStyle: {
        areaColor: '#e9eef7',
        borderColor: '#999',
        borderWidth: 0.5
      },
      emphasis: {
        itemStyle: {
          areaColor: '#cfd8ff',
          borderColor: '#333'
        }
      },
      label: {
        show: false
      }
    },
    series: [
      {
        name: '机场',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbolSize: 12,
        data: [
          { name: from.value, value: fromCoords, itemStyle: { color: '#ff4d4f' } },
          { name: to.value, value: toCoords, itemStyle: { color: '#52c41a' } }
        ],
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          fontSize: 10
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

function queryRoute() {
  const routeKey = `${from.value}_${to.value}`
  if (routeTable[routeKey as keyof typeof routeTable]) {
    route.value = routeTable[routeKey as keyof typeof routeTable]
    
    // 根据查询的航路过滤重规划方案
    reroutes.value = reroutePlans.filter(plan => plan.basedOnRoute === routeKey)
    
    // 根据航路查询对应的NOTAM
    const matchedNotam = notamList.find(n => n.affectedRoute === routeKey)
    if (matchedNotam) {
      notam.value = matchedNotam
    } else {
      // 如果没有找到对应的NOTAM，使用默认
      notam.value = notamList[0]
    }
    
    // 更新地图显示
    updateMapDisplay()
  } else {
    // 如果没有找到该航路，显示提示信息
    alert(`未找到 ${from.value} → ${to.value} 的航路信息`)
    reroutes.value = []
  }
}

onMounted(() => {
  chartInstance = echarts.init(mapRef.value as HTMLDivElement)
  
  // 初始化地图显示默认航路 ZBAA -> ZSPD
  from.value = 'ZBAA'
  to.value = 'ZSPD'
  updateMapDisplay()
  
  window.addEventListener('resize', () => chartInstance?.resize())
})
</script>

<style scoped>
label {
  display: block;
  margin-top: 12px;
  font-size: 14px;
}

select,
button {
  width: 100%;
  margin-top: 6px;
  padding: 8px;
}
</style>
