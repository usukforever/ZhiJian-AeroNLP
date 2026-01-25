// src/modules/routes/mock/notam.ts

export interface Notam {
  id: string
  type: 'MILITARY' | 'WEATHER' | 'ATC' | 'AIRSPACE'
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  affectedRoute: string
  affectedSegment: string
  timeWindow: string
  description: string
  issuedBy: string
}

export const notamList: Notam[] = [
  // ===== 对应 REROUTE-001 / 002 / 003 =====
  {
    id: 'NOTAM-001',
    type: 'MILITARY',
    level: 'HIGH',
    affectedRoute: 'ZBAA_ZSPD',
    affectedSegment: 'DALIM - VMB',
    timeWindow: '2026-01-24 08:00 ~ 18:00 UTC',
    description:
      '因军事演习，DALIM 至 VMB 航段空域临时关闭，禁止民航飞行。',
    issuedBy: 'CAAC / 军方联合发布'
  },

  // ===== 对应 REROUTE-005 / 006 =====
  {
    id: 'NOTAM-002',
    type: 'WEATHER',
    level: 'MEDIUM',
    affectedRoute: 'ZBAA_ZPPP',
    affectedSegment: 'DUGUL - GUBAS',
    timeWindow: '2026-01-24 09:00 ~ 21:00 UTC',
    description:
      '受强对流天气影响，该区域存在雷暴及中度至严重颠簸风险。',
    issuedBy: '民航气象中心'
  },

  // ===== 对应 REROUTE-008 / 009 =====
  {
    id: 'NOTAM-003',
    type: 'ATC',
    level: 'LOW',
    affectedRoute: 'ZSPD_ZBAA',
    affectedSegment: 'TAO - JDW',
    timeWindow: '2026-01-24 07:30 ~ 11:30 UTC',
    description:
      '华北区域早高峰流量控制，部分航班可能需要调整进近与下降策略。',
    issuedBy: '华北区域管制中心'
  },

  // ===== 对应 REROUTE-004（正常航路，无告警）=====
  {
    id: 'NOTAM-004',
    type: 'ATC',
    level: 'LOW',
    affectedRoute: 'ZBAA_ZGGG',
    affectedSegment: '无',
    timeWindow: '无限制',
    description: '航路正常，无实时告警信息。',
    issuedBy: 'CAAC'
  },

  // ===== 对应 REROUTE-007（正常航路，无告警）=====
  {
    id: 'NOTAM-005',
    type: 'ATC',
    level: 'LOW',
    affectedRoute: 'ZSPD_ZPPP',
    affectedSegment: '无',
    timeWindow: '无限制',
    description: '航路正常，无实时告警信息。',
    issuedBy: 'CAAC'
  },

  // ===== 对应 REROUTE-010（正常航路，无告警）=====
  {
    id: 'NOTAM-006',
    type: 'ATC',
    level: 'LOW',
    affectedRoute: 'ZSPD_ZGGG',
    affectedSegment: '无',
    timeWindow: '无限制',
    description: '航路正常，无实时告警信息。',
    issuedBy: 'CAAC'
  },

  // ===== 对应 REROUTE-011（正常航路，无告警）=====
  {
    id: 'NOTAM-007',
    type: 'ATC',
    level: 'LOW',
    affectedRoute: 'ZGGG_ZBAA',
    affectedSegment: '无',
    timeWindow: '无限制',
    description: '航路正常，无实时告警信息。',
    issuedBy: 'CAAC'
  },

  // ===== 对应 REROUTE-012（正常航路，无告警）=====
  {
    id: 'NOTAM-008',
    type: 'ATC',
    level: 'LOW',
    affectedRoute: 'ZGGG_ZSPD',
    affectedSegment: '无',
    timeWindow: '无限制',
    description: '航路正常，无实时告警信息。',
    issuedBy: 'CAAC'
  }
]

