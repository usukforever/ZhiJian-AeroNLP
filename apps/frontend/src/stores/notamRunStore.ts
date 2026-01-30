import { NotamCardModel, REGEX_AIRPORT } from "@/models/NotamCard";
import { notamAnalysisService } from "@/services/notamAnalysisService";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface GroundingContext {
  code: string;
  name: string;
  coordinates: [number, number];
  fir: string;
}

// [新增] 雷达目标接口
export interface RadarTarget {
  code: string;       // ZBAA
  name: string;
  fir: string;
  signalStrength: number; // -30 到 -120 (dB)
  status: 'scanning' | 'locked' | 'warning';
  lastPing: number;
}

// [新增] 简易的机场数据库 Mock
const AIRPORT_DB: Record<string, GroundingContext> = {
  ZBAA: { code: "ZBAA", name: "Beijing Capital Intl", coordinates: [40.0799, 116.6031], fir: "ZBPE" },
  ZSPD: { code: "ZSPD", name: "Shanghai Pudong Intl", coordinates: [31.1443, 121.8083], fir: "ZSHA" },
  ZGGG: { code: "ZGGG", name: "Guangzhou Baiyun Intl", coordinates: [23.3959, 113.2988], fir: "ZGZU" },
  ZUUU: { code: "ZUUU", name: "Chengdu Tianfu Intl", coordinates: [30.5785, 104.1111], fir: "ZPKM" },
  VHHH: { code: "VHHH", name: "Hong Kong Intl", coordinates: [22.3080, 113.9185], fir: "VHHK" },
  RJTT: { code: "RJTT", name: "Tokyo Haneda", coordinates: [35.5494, 139.7798], fir: "RJJJ" },
  WSSS: { code: "WSSS", name: "Singapore Changi", coordinates: [1.3644, 103.9915], fir: "WSJC" },
  KJFK: { code: "KJFK", name: "John F. Kennedy Intl", coordinates: [40.6413, -73.7781], fir: "KZNY" },
  EGLL: { code: "EGLL", name: "London Heathrow", coordinates: [51.4700, -0.4543], fir: "EGTT" },
};

export const useNotamRunStore = defineStore("notam-run", () => {
  // --- State ---
  
  // 1. 卡片流：直接持有 Class 实例的数组
  const cards = ref<NotamCardModel[]>([]);

  // 2. 全局交互状态
  const currentGrounding = ref<GroundingContext | null>(null);

  // [新增] 待处理任务计数 (用于显示 Skeleton 占位)
  const pendingCount = ref(0);

  // 3. 雷达监控列表
  const targets = ref<RadarTarget[]>([
    { code: "ZSPD", name: "Shanghai Pudong", fir: "ZSHA", signalStrength: -42, status: 'scanning', lastPing: Date.now() },
    { code: "VHHH", name: "Hong Kong Intl", fir: "VHHK", signalStrength: -68, status: 'locked', lastPing: Date.now() - 50000 },
    { code: "EGLL", name: "London Heathrow", fir: "EGTT", signalStrength: -95, status: 'warning', lastPing: Date.now() - 120000 },
    { code: "KJFK", name: "New York JFK", fir: "KZNY", signalStrength: -102, status: 'scanning', lastPing: Date.now() - 300000 },
  ]);

  // --- Actions: Card Management ---

  /**
   * 创建一个新任务
   */
  const createRun = (rawText: string) => {
    // 1. 预判机场代码
    const airportMatch = rawText.match(REGEX_AIRPORT);
    // 兜底：如果没找到 A) 项，找文中第一个四字码
    const fallbackCode = !airportMatch ? rawText.match(/\b[A-Z]{4}\b/) : null;
    
    const targetCode = airportMatch ? airportMatch[1] : (fallbackCode ? fallbackCode[0] : null);

    // 2. 查找是否存在该机场的卡片
    const existingCardIndex = targetCode 
      ? cards.value.findIndex(c => c.airportCode === targetCode)
      : -1;

    if (existingCardIndex !== -1) {
      // --- 场景 A: 机场已存在 (Update) ---
      const card = cards.value[existingCardIndex];
      
      // 将卡片移到列表最前面 (置顶)，模拟“最新消息”
      cards.value.splice(existingCardIndex, 1);
      cards.value.unshift(card);
      
      // 触发卡片内部刷新
      card.refresh(rawText);
      card.startAnalysis();
      return card.id;

    } else {
      // --- 场景 B: 新机场 (Create) ---
      const card = new NotamCardModel(rawText);
      cards.value.unshift(card);
      card.startAnalysis();
      return card.id;
    }
  };

  /**
   * [重构] 分析并执行 - 统一入口
   * 无论是输入框回车还是文件上传，都调用此方法
   */
  async function analyzeContent(rawInput: string) {
    // 1. 调用 Service 进行分包处理
    const chunks = notamAnalysisService.preProcessInput(rawInput);

    if (chunks.length === 0) return;

    // 2. 更新 Pending 计数 (驱动 UI 骨架屏)
    pendingCount.value += chunks.length;

    // 3. 逐条处理
    // 使用 for...of 循环配合 await，人为制造一点处理节奏感，避免瞬间卡顿
    for (const chunk of chunks) {
      // 这里的 createRun 内部已经包含了：
      // - 正则提取机场代码
      // - findIndex 查找是否存在现有卡片
      // - 存在 -> 移到顶部并 refresh (触发 update 逻辑)
      // - 不存在 -> unshift 新建 (触发 create 逻辑)
      createRun(chunk);
      
      // 稍微模拟一点间隔，让 UI 有逐个弹出的效果
      await new Promise(r => setTimeout(r, 200)); 
      
      pendingCount.value--;
    }
  }

  // [修改] 模拟批量运行 (保留用于测试，但改用新的 analyzeContent)
//   const simulateBatch = async () => {
//     // 模拟数据
//     const rawDemoData = `
// A0521/24 NOTAMN... ZBAA ... RWY 18L/36R CLSD...
// C1024/24 NOTAMN... ZSPD ... ILS RWY 17L GP U/S...
// A0111/24 NOTAMN... VHHH ... TWY A CLSD PERM...
// A0882/24 NOTAMN... ZGGG ... FIREWORKS DISPLAY...
//     `;
//     // 直接走统一入口
//     await analyzeContent(rawDemoData);
//   }

  const clearAll = () => {
    cards.value = [];
    currentGrounding.value = null;
    pendingCount.value = 0;
  };

  // [修改] 调试版 Grounding 更新逻辑
  const updateGrounding = (text: string) => {
    // console.log("[Store] Updating grounding with text:", text);
    // 移除空白字符，防止 "Z B A A" 这种情况
    const cleanText = text ? text.replace(/\s+/g, " ").trim().toUpperCase() : "";
    if (!cleanText) {
      currentGrounding.value = null;
      return;
    }
    // 正则匹配所有可能的 4 位代码
    const candidates = cleanText.match(/[A-Z]{4}/g);
    if (candidates) {
      // 查找数据库
      const foundCode = candidates.find(code => Object.prototype.hasOwnProperty.call(AIRPORT_DB, code));
      if (foundCode) {
        // 只有当变了才更新，避免闪烁，但如果是从 null 变过来也要更新
        if (currentGrounding.value?.code !== foundCode) {
           currentGrounding.value = AIRPORT_DB[foundCode];
        }
        return;
      }
    }
    // 如果当前有锁定，但新的输入里不再包含该代码，则清除锁定
    // 例如：从 "ZBAA" 删改成 "ZBA"
    if (currentGrounding.value && !cleanText.includes(currentGrounding.value.code)) {
      console.log("[Store] Clearing grounding");
      currentGrounding.value = null;
    }
  };

  // [新增] 添加订阅
  const addTarget = (code: string) => {
    // 查库
    const info = AIRPORT_DB[code];
    if (!info) return;

    // 查重
    if (targets.value.find(t => t.code === code)) return;

    targets.value.unshift({
      code: info.code,
      name: info.name.replace(" Intl", ""), // 简化名字
      fir: info.fir,
      signalStrength: Math.floor(Math.random() * -60) - 30, // 随机信号
      status: 'scanning',
      lastPing: Date.now()
    });
  };

  // [新增] 移除订阅
  const removeTarget = (code: string) => {
    targets.value = targets.value.filter(t => t.code !== code);
  };

  // [新增] 激活某个目标到主雷达
  const activateTarget = (code: string) => {
    // 复用 updateGrounding 的逻辑，直接把文本传进去
    updateGrounding(code);
  };

  return {
    // State
    cards,
    currentGrounding,
    targets,
    pendingCount, // 导出
    
    // Card Actions
    // createRun,
    analyzeContent, // 导出
    // simulateBatch,
    clearAll,
    
    // Global Actions
    updateGrounding,
    addTarget,
    removeTarget,
    activateTarget
  };
});
