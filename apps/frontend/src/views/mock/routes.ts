// 基础航路数据（AIRAC 周期）

export interface Airport {
  code: string
  name: string
  lat: number
  lng: number
}

export interface Route {
  from: string
  to: string
  heading: number
  distance: number
  directDistance: number
  navCount: number
  rvsm: string[]
  routeString: string
  navPoints: string[]
}

// 机场数据
export const airports: Airport[] = [
  { code: 'ZBAA', name: '北京首都', lat: 40.0801, lng: 116.5846 },
  { code: 'ZSPD', name: '上海浦东', lat: 31.1517, lng: 121.7998 },
  { code: 'ZGGG', name: '广州白云', lat: 23.3913, lng: 113.3055 },
  { code: 'ZPPP', name: '成都双流', lat: 30.5753, lng: 104.0658 }
]

export const routeTable: Record<string, Route> = {
  // ZBAA -> ZSPD
  ZBAA_ZSPD: {
    from: 'ZBAA',
    to: 'ZSPD',
    heading: 153,
    distance: 638,
    directDistance: 593,
    navCount: 24,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString:
      'ZBAA SID ELKUR W40 YQG W142 DALIM A593 VMB W161 SASAN STAR ZSPD',
    navPoints: ['ZBAA', 'ELKUR', 'YQG', 'DALIM', 'VMB', 'SASAN', 'ZSPD']
  },

  // ZBAA -> ZGGG
  ZBAA_ZGGG: {
    from: 'ZBAA',
    to: 'ZGGG',
    heading: 190,
    distance: 1032,
    directDistance: 1016,
    navCount: 39,
    rvsm: ['FL301', 'FL321', 'FL341', '以上'],
    routeString:
      'ZBAA SID OMDEK W37 VIKEB V66 VESUX W45 IKAVO STAR ZGGG',
    navPoints: ['ZBAA', 'OMDEK', 'VIKEB', 'VESUX', 'IKAVO', 'ZGGG']
  },
//ZBAA->ZPPP
  ZBAA_ZPPP: {
    from: 'ZBAA',
    to: 'ZPPP',
    heading: 210,
    distance: 1456,
    directDistance: 1389,
    navCount: 31,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString:
      'ZBAA SID LULIX V106 DUGUL W106 GUBAS V32 DAXUN STAR ZPPP',
    navPoints: ['ZBAA', 'LULIX', 'DUGUL', 'GUBAS', 'DAXUN', 'ZPPP']
  },

  // ZSPD -> ZPPP
  ZSPD_ZPPP: {
    from: 'ZSPD',
    to: 'ZPPP',
    heading: 254,
    distance: 1094,
    directDistance: 1061,
    navCount: 26,
    rvsm: ['FL301', 'FL321', 'FL341', '以上'],
    routeString:
      'ZSPD SID SASAN R343 ESBAG W581 SNQ W546 OREVO W164 VILID V65 IKUBA V106 GUGAM A581 XISLI STAR ZPPP',
    navPoints: [
      'ZSPD',
      'SASAN',
      'ESBAG',
      'SNQ',
      'OREVO',
      'VILID',
      'IKUBA',
      'GUGAM',
      'XISLI',
      'ZPPP'
    ]
  },
  //ZSPD->ZBAA
  ZSPD_ZBAA: {
    from: 'ZSPD',
    to: 'ZBAA',
    heading:336,
    distance:638,
    directDistance:593,
    navCount:17,
    rvsm:['FL301', 'FL321', 'FL341', '以上'],
    routeString:
    'ZSPD SID ODULO B221 XDX W174 TAO W103 JDW V89 DOVIV W55 DUMAP STAR ZBAA',
    navPoints:['ZSPD', 'ODULO', 'XDX', 'TAO', 'JDW', 'DOVIV', 'DUMAP', 'ZBAA']
  },
  //ZSPD->ZGGG
  ZSPD_ZGGG: {
    from: 'ZSPD',
    to: 'ZGGG',
    heading:226,
    distance:666,
    directDistance:649,
    navCount:16,
    rvsm:['FL301', 'FL321', 'FL341', '以上'],
    routeString:
      'ZSPD SID ADBAS W135 TUPGA A599 PLT W19 OLPAB STAR ZGGG',
    navPoints:['ZSPD', 'ADBAS', 'TUPGA', 'PLT', 'OLPAB', 'ZGGG']
  },
    //ZGGG->ZBAA
    ZGGG_ZBAA: {
    from: 'ZGGG',
    to: 'ZBAA',
    heading:8,
    distance:1031,
    directDistance:1016,
    navCount:39,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString: 'ZGGG SID MIKIP A461 BUBDA W56 DUGEB STAR ZBAA',
    navPoints:['ZGGG', 'MIKIP', 'BUBDA', 'DUGEB', 'ZBAA']
  },
    //ZGGG->ZSPD
    ZGGG_ZSPD: {
    from: 'ZGGG',
    to: 'ZSPD',
    heading:42,
    distance:695,
    directDistance:649,
    navCount:19,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString:
    'ZGGG SID BOVMA W41 DOPKU G471 PLT A599 ELNEX G204 MULOV V73 SUPAR B221 AND STAR ZSPD',
    navPoints:['ZGGG', 'BOVMA', 'DOPKU', 'PLT', 'ELNEX', 'MULOV', 'SUPAR', 'AND', 'ZSPD']
  },
  //ZGGG->ZPPP
  ZGGG_ZPPP: {
    from: 'ZGGG',
    to: 'ZPPP',
    heading:282,
    distance:635,
    directDistance:577,
    navCount:18,
    rvsm: ['FL291', 'FL321', 'FL341', '以上'],
    routeString:'ZGGG SID SAREX W7 POU A599 LXI STAR ZPPP',
    navPoints:['ZGGG', 'SAREX', 'POU', 'LXI', 'ZPPP']
  },
  //ZPPP->ZBAA
  ZPPP_ZBAA: {
    from: 'ZPPP',
    to: 'ZBAA',
    heading:34,
    distance:1214,
    directDistance:1131,
    navCount:32,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString:'ZPPP SID DADOL W144 IGNAK W179 WFX W233 VIMAM B330 UBKER G212 NSH W275 WJC G212 TONOV V152 GUVRI W56 DUGEB STAR ZBAA',
    navPoints:['ZPPP', 'DADOL', 'IGNAK', 'WFX', 'VIMAM', 'UBKER', 'NSH', 'WJC', 'TONOV', 'GUVRI', 'DUGEB', 'ZBAA']
  },
  //ZPPP->ZSPD
  ZPPP_ZSPD: {
    from: 'ZPPP',
    to: 'ZSPD',
    heading:65,
    distance:1095,
    directDistance:1061,
    navCount:27,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString: 'ZPPP SID NODIB W137 LPS A581 GUGAM V106 IKUBA V65 VILID W164 OREVO W546 SNQ W581 ESBAG R343 SASAN STAR ZSPD',
    navPoints:['ZPPP', 'NODIB', 'LPS', 'GUGAM', 'IKUBA', 'VILID', 'OREVO', 'SNQ', 'ESBAG', 'SASAN', 'ZSPD']
  },
  //ZPPP->ZGGG
  ZPPP_ZGGG: {
    from: 'ZPPP',
    to: 'ZGGG',
    heading:98,
    distance:594,
    directDistance:577,
    navCount:16,
    rvsm: ['FL291', 'FL311', 'FL331', '以上'],
    routeString: 'ZPPP SID LXI A599 GYA STAR ZGGG',
    navPoints:['ZPPP', 'LXI', 'GYA', 'ZGGG']
  },
}