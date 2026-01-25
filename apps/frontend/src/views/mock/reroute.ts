// src/modules/routes/mock/reroute.ts

export interface ReroutePlan {
  id: string
  basedOnRoute: string        // 原航路 key
  triggerNotamId: string      // 触发的 NOTAM
  title: string
  route: string               // 新航路字符串
  delta: string               // 与原航路差异
  costImpact: number          // 成本变化（百分比）
  timeImpact: number          // 时间变化（分钟）
  safetyLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  recommendation: 'A' | 'B' | 'C'
}

export const reroutePlans: ReroutePlan[] = [
  // --------- ZBAA -> ZSPD（突发状况，有 3 个方案） ---------
  {
    id: 'REROUTE-001',
    basedOnRoute: 'ZBAA_ZSPD',
    triggerNotamId: 'NOTAM-001',
    title: '方案 A：绕飞 DALIM 空域',
    route:
      'ZBAA SID ELKUR W40 YQG W142 LARAD A593 VMB W161 SASAN STAR ZSPD',
    delta: '+45 NM / +6 分钟',
    costImpact: 3.2,
    timeImpact: 6,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },
  {
    id: 'REROUTE-002',
    basedOnRoute: 'ZBAA_ZSPD',
    triggerNotamId: 'NOTAM-001',
    title: '方案 B：低流量航路调整',
    route:
      'ZBAA SID ELKUR W40 YQG W142 DALIM W185 LARAD STAR ZSPD',
    delta: '+30 NM / +4 分钟',
    costImpact: 2.1,
    timeImpact: 4,
    safetyLevel: 'MEDIUM',
    recommendation: 'B'
  },
  {
    id: 'REROUTE-003',
    basedOnRoute: 'ZBAA_ZSPD',
    triggerNotamId: 'NOTAM-001',
    title: '方案 C：降低飞行高度避免冲突',
    route: 'ZBAA SID ELKUR W40 YQG W142 DALIM A593 VMB W150 SASAN STAR ZSPD',
    delta: '+32 NM / +5 分钟',
    costImpact: 2.5,
    timeImpact: 5,
    safetyLevel: 'MEDIUM',
    recommendation: 'C'
  },

  // --------- ZBAA -> ZGGG（正常航路，单方案） ---------
  {
    id: 'REROUTE-004',
    basedOnRoute: 'ZBAA_ZGGG',
    triggerNotamId: '',
    title: '正常航路，无需绕飞',
    route: 'ZBAA SID OMDEK W37 VIKEB V66 VESUX W45 IKAVO STAR ZGGG',
    delta: '0 NM / 0 分钟',
    costImpact: 0,
    timeImpact: 0,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },

  // --------- ZBAA -> ZPPP（突发状况，2 个方案） ---------
  {
    id: 'REROUTE-005',
    basedOnRoute: 'ZBAA_ZPPP',
    triggerNotamId: 'NOTAM-002',
    title: '方案 A：绕飞 GUBAS 空域',
    route: 'ZBAA SID LULIX V106 DUGUL W106 LUGIX V32 DAXUN STAR ZPPP',
    delta: '+20 NM / +5 分钟',
    costImpact: 2.0,
    timeImpact: 5,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },
  {
    id: 'REROUTE-006',
    basedOnRoute: 'ZBAA_ZPPP',
    triggerNotamId: 'NOTAM-002',
    title: '方案 B：低空段优化',
    route: 'ZBAA SID LULIX V106 DUGUL W106 GUBAS V32 DAXUN STAR ZPPP',
    delta: '+12 NM / +3 分钟',
    costImpact: 1.3,
    timeImpact: 3,
    safetyLevel: 'MEDIUM',
    recommendation: 'B'
  },

  // --------- ZSPD -> ZPPP（正常航路） ---------
  {
    id: 'REROUTE-007',
    basedOnRoute: 'ZSPD_ZPPP',
    triggerNotamId: '',
    title: '正常航路，无需绕飞',
    route: 'ZSPD SID SASAN R343 ESBAG W581 SNQ W546 OREVO W164 VILID V65 IKUBA V106 GUGAM A581 XISLI STAR ZPPP',
    delta: '0 NM / 0 分钟',
    costImpact: 0,
    timeImpact: 0,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },

  // --------- ZSPD -> ZBAA（突发状况，2 个方案） ---------
  {
    id: 'REROUTE-008',
    basedOnRoute: 'ZSPD_ZBAA',
    triggerNotamId: 'NOTAM-003',
    title: '方案 A：优化下降段航路',
    route: 'ZSPD SID ODULO B221 XDX W174 TAO W103 JDW V89 DOVIV STAR ZBAA',
    delta: '-10 NM / -3 分钟',
    costImpact: -1.0,
    timeImpact: -3,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },
  {
    id: 'REROUTE-009',
    basedOnRoute: 'ZSPD_ZBAA',
    triggerNotamId: 'NOTAM-003',
    title: '方案 B：低空段分流',
    route: 'ZSPD SID ODULO B221 XDX W174 TAO W103 JDW V89 DUMAP STAR ZBAA',
    delta: '-8 NM / -2 分钟',
    costImpact: -0.8,
    timeImpact: -2,
    safetyLevel: 'MEDIUM',
    recommendation: 'B'
  },

  // --------- 其余航路（单方案，正常） ---------
  {
    id: 'REROUTE-010',
    basedOnRoute: 'ZSPD_ZGGG',
    triggerNotamId: '',
    title: '正常航路，无需绕飞',
    route: 'ZSPD SID ADBAS W135 TUPGA A599 PLT W19 OLPAB STAR ZGGG',
    delta: '0 NM / 0 分钟',
    costImpact: 0,
    timeImpact: 0,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },
  {
    id: 'REROUTE-011',
    basedOnRoute: 'ZGGG_ZBAA',
    triggerNotamId: '',
    title: '正常航路，无需绕飞',
    route: 'ZGGG SID MIKIP A461 BUBDA W56 DUGEB STAR ZBAA',
    delta: '0 NM / 0 分钟',
    costImpact: 0,
    timeImpact: 0,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  },
  {
    id: 'REROUTE-012',
    basedOnRoute: 'ZGGG_ZSPD',
    triggerNotamId: '',
    title: '正常航路，无需绕飞',
    route: 'ZGGG SID BOVMA W41 DOPKU G471 PLT A599 ELNEX G204 MULOV V73 SUPAR B221 AND STAR ZSPD',
    delta: '0 NM / 0 分钟',
    costImpact: 0,
    timeImpact: 0,
    safetyLevel: 'HIGH',
    recommendation: 'A'
  }
]
