import { notamAnalysisService, AnalysisEventType, StreamEvent } from '@/services/notamAnalysisService';
import { reactive } from 'vue';

// --- 类型定义区 (原 Store 中的定义下沉至此) ---

// [新增] 导出正则，方便 Store 在创建卡片前预判
export const REGEX_AIRPORT = /A\)\s*([A-Z]{4})/;
export const REGEX_ID = /[A-Z]\d{4}\/\d{2}/;

export const NotamStage = {
  IDLE: "idle",
  CONNECTING: "connecting",
  DISCOVERING: "discovering",
  ANALYZING: "analyzing",
  VALIDATING: "validating",
  FINALIZED: "finalized",
  FAILED: "failed"
} as const;
export type NotamStage = typeof NotamStage[keyof typeof NotamStage];

export const AgentType = {
  DISCOVERY: "DISCOVERY",
  ANALYST: "ANALYST",
  VALIDATOR: "VALIDATOR"
} as const;
export type AgentType = typeof AgentType[keyof typeof AgentType];

export const AlertSeverity = {
  INFO: "info",       // 🔵 蓝色：常规信息
  WARNING: "warning", // 🟡 黄色：降级/受限
  CRITICAL: "critical", // 🔴 红色：关闭/不可用
  ACTIVE: "active"    // 🟢 绿色：生效中 (正面)
} as const;
export type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];

// 4. 时效状态
export const TimeStatus = {
  ACTIVE: "active",
  PENDING: "pending",
  EXPIRED: "expired",
  PERM: "perm",
  UNKNOWN: "unknown"
} as const;
export type TimeStatus = typeof TimeStatus[keyof typeof TimeStatus];

// [新增] NOTAM 类型枚举
export const NotamType = {
  NEW: 'N',
  REPLACE: 'R',
  CANCEL: 'C'
} as const;
export type NotamType = typeof NotamType[keyof typeof NotamType];

// [新增] 业务领域枚举 (对应论文分类)
export const EntityDomain = {
  RUNWAY: "RUNWAY",       // 跑道/滑行道
  AIRSPACE: "AIRSPACE",   // 空域管理
  NAV_AID: "NAV_AID",     // 助航设施
  AG_FACILITY: "AG_FACILITY", // 地面设施
  OBSTACLE: "OBSTACLE",   // 飞行危险
  SERVICE: "SERVICE",     // 服务 (消防, ATC)
  OTHER: "OTHER"
} as const;
export type EntityDomain = typeof EntityDomain[keyof typeof EntityDomain];

// [新增] 实体状态枚举 (决定 UI 颜色)
export const EntityStatus = {
  CLOSED: "CLOSED",         // 🔴 关闭
  UNSERVICEABLE: "UNSERVICEABLE", // 🔴 故障
  RESTRICTED: "RESTRICTED", // 🟡 受限
  CHANGED: "CHANGED",       // 🔵 变更
  ACTIVE: "ACTIVE",         // 🟢 生效
  NORMAL: "NORMAL"          // ⚪ 恢复
} as const;
export type EntityStatus = typeof EntityStatus[keyof typeof EntityStatus];

// [新增] 几何类型 (GeoJSON 风格)
export const GeometryType = {
  POINT: "Point",
  LINE_STRING: "LineString",
  POLYGON: "Polygon",
  CIRCLE: "Circle" // 扩展类型，GeoJSON 标准无 Circle，但航空很常用
} as const;
export type GeometryType = typeof GeometryType[keyof typeof GeometryType];

// ==========================================
// 2. 核心数据接口 (Data Structures)
// ==========================================

// 地理坐标点
export interface GeoPoint {
  lat: number;
  lon: number;
  alt?: number; // 海拔 (米)
}

// 几何形状定义
export interface Geometry {
  type: GeometryType;
  coordinates: GeoPoint | GeoPoint[] | GeoPoint[][]; // 点 | 线 | 面
  radius?: number; // 仅当 type 为 Circle 时使用 (单位: 海里 NM)
}

// 垂直限制 (3D 地图预留)
export interface VerticalLimits {
  lower?: string; // e.g. "GND", "FL100"
  upper?: string; // e.g. "3000M AMSL", "UNL"
}

// [核心] 受影响实体 (微观层)
export interface ImpactedEntity {
  id: string;           // 唯一标识 (UUID)
  domain: EntityDomain; // 领域图标
  designator: string;   // 展示名称 (e.g. "RWY 18L")
  status: EntityStatus; // 状态颜色
  reason?: string;      // 简短原因 (e.g. "WIP")
  location?: string;    // 文字描述位置
  geometry?: Geometry;  // [地图] 实体精确坐标
}

// [核心] 宏观空间数据 (宏观层 - Q行)
export interface SpatialData {
  center: GeoPoint;
  radius_nm: number;
  geometry_type: GeometryType; // 通常是 CIRCLE 或 POLYGON
  vertical?: VerticalLimits;   // 整个空域的高度限制
}

// 有效期定义
export interface ValidityPeriod {
  from: string;    // ISO string
  to: string;      // ISO string
  isPerm: boolean; // 是否永久
  duration_text?: string; // [新增] 语义化时长 (e.g. "4h 30m")
}

// [重构] 完整的结构化数据 V2
export interface NotamStructuredData {
  identifier: string;    // A0123/24
  type: NotamType; // New, Replace, Cancel
  
  // 第一层: 结构化实体
  impacted_entities: ImpactedEntity[];
  
  // 第二层: 宏观空间范围 (Q-Code)
  spatial_data?: SpatialData;

  // 第三层: AI 摘要与解释
  summary: string;

  // 第四层: 辅助元数据
  validity: ValidityPeriod;
  severity: AlertSeverity;
  tags: string[];        // 保留作为辅助搜索的关键词
  confidence: number;    // 0-100
}

export interface ThoughtLog {
  id: string;
  agent: AgentType;
  content: string;
  timestamp: number;
  isStreaming: boolean;
}

// 历史快照
export interface NotamHistoryItem {
  timestamp: number;
  rawText: string;
  data: NotamStructuredData;
}

/**
 * NotamCardModel
 * 一个自包含的领域模型，负责管理单条 NOTAM 的生命周期、数据解析和 AI 思考流。
 */
export class NotamCardModel {
  // --- 核心状态 ---
  id: string; // 内部 UUID
  rawText: string;
  airportCode: string = "Pending"; // 初始状态
  
  // UI 状态
  stage: NotamStage = NotamStage.IDLE;
  isExpanded: boolean = false; // 控制 UI 折叠/展开
  
  // AI 思考过程 (Log Stream)
  thoughts: ThoughtLog[] = [];

  // [新增] 历史记录栈
  history: NotamHistoryItem[] = [];
  
  // 最终产出 (Structured Output)
  // 给予默认空值，方便 UI 渲染
  data: NotamStructuredData = {
    identifier: "PENDING",
    type: NotamType.NEW,
    impacted_entities: [],
    summary: "",
    severity: AlertSeverity.INFO,
    tags: [],
    validity: { from: "", to: "", isPerm: false },
    confidence: 0
  };

  // [新增] 计算属性：获取当前业务时效状态
  // 注意：在 Class 中使用 getter，配合 reactive 可以实现响应式
  get timeStatus(): TimeStatus {
    if (this.stage !== NotamStage.FINALIZED && this.stage !== NotamStage.IDLE) return TimeStatus.UNKNOWN;
    
    if (this.data.validity.isPerm) return TimeStatus.PERM;

    const now = new Date();
    const from = new Date(this.data.validity.from);
    const to = new Date(this.data.validity.to);

    if (isNaN(from.getTime())) return TimeStatus.UNKNOWN;

    if (now < from) return TimeStatus.PENDING;
    if (to && now > to) return TimeStatus.EXPIRED;
    
    return TimeStatus.ACTIVE;
  }

  constructor(rawText: string, id?: string) {
    this.id = id || crypto.randomUUID();
    this.rawText = rawText;
    this.extractBasicInfo();
    // [关键] 使用 reactive 包裹实例自身
    // 这样在 Vue 组件中直接使用 card.stage 或 card.data 都是响应式的
    return reactive(this) as NotamCardModel;
  }

  // 初步正则提取 (快速响应)
  extractBasicInfo() {
    const idMatch = this.rawText.match(REGEX_ID);
    if (idMatch) this.data.identifier = idMatch[0];

    // 简单判断类型：如果不是 N/R/C 默认设为 NEW
    // 后续在 Service 深度解析时会覆盖这个值
    const typeMatch = this.rawText.match(/NOTAM([NRC])/);
    if (typeMatch) {
        this.data.type = typeMatch[1] as NotamType;
    }

    const airportMatch = this.rawText.match(REGEX_AIRPORT);
    if (airportMatch) {
      this.airportCode = airportMatch[1];
    } else {
        const fallbackMatch = this.rawText.match(/\b[A-Z]{4}\b/);
        if (fallbackMatch && !['NOTAM', 'Q)', 'A)', 'B)', 'C)', 'D)', 'E)'].includes(fallbackMatch[0])) {
             this.airportCode = fallbackMatch[0];
        }
    }
  }

  // --- 行为方法 (Actions) ---

  

  // 刷新逻辑
  async refresh(newRawText: string) {
    if (this.stage === NotamStage.FINALIZED) {
      this.history.unshift({
        timestamp: Date.now(),
        rawText: this.rawText,
        data: JSON.parse(JSON.stringify(this.data)) 
      });
    }

    this.rawText = newRawText;
    this.stage = NotamStage.IDLE;
    this.isExpanded = true;
    this.thoughts = [];
    
    // 重置数据
    this.data = {
      identifier: "UPDATING...",
      type: NotamType.NEW, // [修改] 使用枚举
      impacted_entities: [], 
      spatial_data: undefined,
      summary: "",
      severity: AlertSeverity.INFO,
      tags: [],
      validity: { from: "", to: "", isPerm: false },
      confidence: 0
    };
    
    this.extractBasicInfo();
  }

  restore(historyItem: NotamHistoryItem) {
    // 1. 把当前状态存入历史 (Undo Stack)
    this.history.unshift({
        timestamp: Date.now(),
        rawText: this.rawText,
        data: JSON.parse(JSON.stringify(this.data))
    });
    
    // 2. 恢复旧状态
    this.rawText = historyItem.rawText;
    this.data = JSON.parse(JSON.stringify(historyItem.data));
    this.stage = NotamStage.FINALIZED;
}

  /**
   * [重构] 核心分析方法
   * 对接 Service 的 Async Generator，实现真正的流式响应
   */
  async startAnalysis() {
    this.stage = NotamStage.CONNECTING;
    this.isExpanded = true;
    
    try {
      // 1. 建立流连接
      const stream = notamAnalysisService.analyzeStream(this.rawText, this.airportCode);
      
      // 2. 消费流事件 (Consumer Pattern)
      for await (const event of stream) {
        this.handleStreamEvent(event);
      }

    } catch (error) {
      console.error("Analysis Stream Failed", error);
      this.stage = NotamStage.FAILED;
      this.thoughts.push({
        id: crypto.randomUUID(),
        agent: AgentType.DISCOVERY,
        content: "Error: Stream connection interrupted.",
        timestamp: Date.now(),
        isStreaming: false
      });
    }
  }

  /**
   * [新增] 事件处理分发器
   * 将复杂的 switch 逻辑抽离，保持主流程清晰
   */
  handleStreamEvent(event: StreamEvent) {
    switch (event.type) {
      case AnalysisEventType.STAGE_CHANGE:
        // 阶段切换时，强制结束上一段思考
        this.finishCurrentStreamingLog();
        this.stage = event.value;
        break;

      case AnalysisEventType.THOUGHT_START:
        this.finishCurrentStreamingLog();
        this.thoughts.push({
          id: crypto.randomUUID(),
          agent: event.agent,
          content: '', // 初始为空，等待 DELTA 填充
          timestamp: Date.now(),
          isStreaming: true
        });
        break;

      case AnalysisEventType.THOUGHT_DELTA:
        // 找到当前正在“打字”的那条日志，追加内容
        const activeLog = this.thoughts.find(t => t.isStreaming);
        if (activeLog) {
          activeLog.content += event.content;
        }
        break;

      case AnalysisEventType.DATA_UPDATE:
        // 增量更新结构化数据 (Deep Merge 已经在 Service 层处理好，这里直接 Assign 即可)
        Object.assign(this.data, event.data);
        break;

      case AnalysisEventType.DONE:
        this.finishCurrentStreamingLog();
        this.stage = NotamStage.FINALIZED;
        // 如果是无关紧要的信息，分析完自动折叠，避免干扰
        if (this.data.severity === AlertSeverity.INFO) {
           // this.isExpanded = false; // 可选策略
        }
        break;

      case AnalysisEventType.ERROR:
        this.finishCurrentStreamingLog();
        this.stage = NotamStage.FAILED;
        this.thoughts.push({
          id: crypto.randomUUID(),
          agent: AgentType.DISCOVERY, // 默认归给 Discovery 报错
          content: `System Error: ${event.message}`,
          timestamp: Date.now(),
          isStreaming: false
        });
        break;
    }
  }

  // 辅助：确保所有日志的 loading 游标都关闭
  finishCurrentStreamingLog() {
    this.thoughts.forEach(t => t.isStreaming = false);
  }

  // 手动更新数据的入口 (用于 Human-in-the-loop 修正)
  updateData(patch: Partial<NotamStructuredData>) {
    Object.assign(this.data, patch);
  }
}