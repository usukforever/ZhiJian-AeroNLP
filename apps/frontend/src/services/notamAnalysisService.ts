import { 
  NotamStage, 
  AgentType, 
  AlertSeverity, 
  EntityDomain, 
  EntityStatus, 
  GeometryType,
  NotamType,
  type NotamStructuredData,
  type ImpactedEntity,
  type SpatialData
} from "@/models/NotamCard";

// [新增] 导出正则工具，供 Service 内部和 Store 使用
export const REGEX_SPLIT_ID = /[A-Z]\d{4}\/\d{2}\b/g;

export const AnalysisEventType = {
  STAGE_CHANGE: 'stage_change',     // 阶段流转 (e.g. CONNECTING -> DISCOVERING)
  THOUGHT_START: 'thought_start',   // 智能体开始思考
  THOUGHT_DELTA: 'thought_delta',   // 思考内容打字机输出
  DATA_UPDATE: 'data_update',       // 结构化数据增量更新
  DONE: 'done',                     // 完成
  ERROR: 'error'                    // 错误
} as const;
export type AnalysisEventType = typeof AnalysisEventType[keyof typeof AnalysisEventType];

export type StreamEvent = 
  | { type: typeof AnalysisEventType.STAGE_CHANGE; value: NotamStage }
  | { type: typeof AnalysisEventType.THOUGHT_START; agent: AgentType }
  | { type: typeof AnalysisEventType.THOUGHT_DELTA; content: string }
  | { type: typeof AnalysisEventType.DATA_UPDATE; data: Partial<NotamStructuredData> }
  | { type: typeof AnalysisEventType.DONE }
  | { type: typeof AnalysisEventType.ERROR; message: string };

// 内部工具：模拟网络延迟
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * 模拟后端 AI 解析服务
 * 职责：接收原始文本 -> 输出推理链 + 结构化数据
 */
const canceledAnalyses = new Set<string>();

export const notamAnalysisService = {
  cancelAnalysis(id: string) {
    canceledAnalyses.add(id);
  },
  // [新增] 预处理：将原始大文本切分为独立的 NOTAM 片段
  // 职责：纯粹的文本处理，不涉及 Store 业务
  preProcessInput(rawInput: string): string[] {
    if (!rawInput) return [];
    
    // 1. 尝试匹配标准的 NOTAM ID (e.g., A1234/24)
    const matches = Array.from(rawInput.matchAll(REGEX_SPLIT_ID));
    
    if (matches.length > 0) {
      const chunks: string[] = [];
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index!;
        const end = i < matches.length - 1 ? matches[i + 1].index! : rawInput.length;
        const chunk = rawInput.slice(start, end).trim();
        if (chunk.length > 10) { // 过滤太短的噪点
          chunks.push(chunk);
        }
      }
      return chunks;
    } 
    
    // 2. 如果没找到标准头，视为单条处理
    return rawInput.trim().length > 5 ? [rawInput.trim()] : [];
  },
  /**
   * 核心流式分析器
   * 模拟后端 Agent Workflow: Discovery -> Analyst -> Validator
   */
  async *analyzeStream(rawText: string, airportCode: string, analysisId?: string): AsyncGenerator<StreamEvent> {
    const isCanceled = () => (analysisId ? canceledAnalyses.has(analysisId) : false);
    
    try {
      if (isCanceled()) return;
      // --- Phase 0: Connection ---
      yield { type: AnalysisEventType.STAGE_CHANGE, value: NotamStage.CONNECTING };
      await sleep(600); // 模拟握手延迟
      if (isCanceled()) return;

      // --- Phase 1: Discovery Agent (信息提取) ---
      yield { type: AnalysisEventType.STAGE_CHANGE, value: NotamStage.DISCOVERING };
      yield { type: AnalysisEventType.THOUGHT_START, agent: AgentType.DISCOVERY };
      
      const discoveryLog = `Initializing Semantic Parser...\nTarget Aerodrome: [${airportCode}]\nScanning for spatial entities and temporal constraints...`;
      yield* simulateTokenStream(discoveryLog);
      
      await sleep(400);
      if (isCanceled()) return;

      // [Mock] 模拟 Discovery 发现了一些实体，但还没分析出严重程度
      // 这里先根据 Q 行或者正则提取出初步的 ID 和 类型
      const initialData: Partial<NotamStructuredData> = {
        type: rawText.includes('NOTAMC') ? NotamType.CANCEL : (rawText.includes('NOTAMR') ? NotamType.REPLACE : NotamType.NEW),
        // 模拟 Q 行解析出的宏观范围 (The "Big Circle")
        spatial_data: {
          center: { lat: 39.50, lon: 116.41 }, // 假设是 ZBAA 附近
          radius_nm: 5,
          geometry_type: GeometryType.CIRCLE,
          vertical: { lower: 'GND', upper: 'UNL' }
        }
      };
      yield { type: AnalysisEventType.DATA_UPDATE, data: initialData };


      // --- Phase 2: Analyst Agent (逻辑推理) ---
      yield { type: AnalysisEventType.STAGE_CHANGE, value: NotamStage.ANALYZING };
      yield { type: AnalysisEventType.THOUGHT_START, agent: AgentType.ANALYST };
      
      // 根据关键词决定 Mock 的剧本
      const isClosed = rawText.includes("CLOSED") || rawText.includes("CLSD");
      const isUs = rawText.includes("U/S") || rawText.includes("UNSERVICEABLE");
      
      let analystLog = "";
      let analystData: Partial<NotamStructuredData> = {};

      if (isClosed) {
        analystLog = "Detected critical keyword 'CLOSED'.\nMapping Entity: RUNWAY 18L/36R.\nQuerying Knowledge Graph for geometry...\nAssessing Operational Impact: HIGH.";
        
        // [核心] 构造复杂的 V2 结构化数据
        const closedEntity: ImpactedEntity = {
          id: crypto.randomUUID(),
          domain: EntityDomain.RUNWAY,
          designator: "RWY 18L/36R",
          status: EntityStatus.CLOSED,
          reason: "MAINTENANCE WIP",
          location: "ENTIRE LENGTH",
          // [Mock] 模拟知识图谱查出来的跑道精确坐标 (LineString)
          geometry: {
            type: GeometryType.LINE_STRING,
            coordinates: [
              { lat: 39.51, lon: 116.42 },
              { lat: 39.49, lon: 116.40 }
            ]
          }
        };

        analystData = {
          severity: AlertSeverity.CRITICAL,
          summary: "跑道 18L/36R 因维修施工全长关闭。预计对进出港航班造成重大延误，请检查备降场。",
          impacted_entities: [closedEntity],
          tags: ['RWY', 'CLOSED', 'MAINT'],
          confidence: 99
        };

      } else if (isUs) {
        analystLog = "Detected status 'U/S' (Unserviceable).\nEntity: ILS DME.\nImpact: CAT II/III Approach not available.\nSeverity: WARNING.";
        
        const usEntity: ImpactedEntity = {
          id: crypto.randomUUID(),
          domain: EntityDomain.NAV_AID,
          designator: "ILS RWY 36R",
          status: EntityStatus.UNSERVICEABLE,
          reason: "TECHNICAL FAILURE",
          // 导航台通常是一个点
          geometry: {
            type: GeometryType.POINT,
            coordinates: { lat: 39.52, lon: 116.43 }
          }
        };

        analystData = {
          severity: AlertSeverity.WARNING,
          summary: "36R 跑道 ILS 系统故障不可用。仅支持非精密进近，请注意天气标准。",
          impacted_entities: [usEntity],
          tags: ['ILS', 'U/S', 'NAV'],
          confidence: 92
        };

      } else {
        analystLog = "Scanning complete. No restrictive keywords found.\nCategorizing as General Information.";
        analystData = {
          severity: AlertSeverity.INFO,
          summary: "常规机场信息通报。无明显运行限制。",
          impacted_entities: [], // 空数组表示无特定实体受损
          tags: ['INFO'],
          confidence: 85
        };
      }

      yield* simulateTokenStream(analystLog);
      yield { type: AnalysisEventType.DATA_UPDATE, data: analystData };
      
      await sleep(300);
      if (isCanceled()) return;

      // --- Phase 3: Validator Agent (校验与格式化) ---
      yield { type: AnalysisEventType.STAGE_CHANGE, value: NotamStage.VALIDATING };
      yield { type: AnalysisEventType.THOUGHT_START, agent: AgentType.VALIDATOR };
      
      const validatorLog = "Cross-referencing validity period with AIP...\nConsistency Check: PASSED.\nFinalizing output structure.";
      yield* simulateTokenStream(validatorLog);

      // 补全有效期 (Mock)
      const now = new Date();
      const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      yield { 
        type: AnalysisEventType.DATA_UPDATE, 
        data: {
          validity: {
            from: now.toISOString(),
            to: nextDay.toISOString(),
            isPerm: false,
            duration_text: "24h 00m" // [Mock] 语义化时长
          }
        } 
      };

      // --- Done ---
      yield { type: AnalysisEventType.DONE };

    } catch (e) {
      console.error("Stream Error:", e);
      yield { type: AnalysisEventType.ERROR, message: "Internal Reasoning Error" };
    } finally {
      if (analysisId) canceledAnalyses.delete(analysisId);
    }
  }
};

/**
 * 模拟 LLM 的 Token 输出流
 * 随机产生 2-5 个字符的 chunk，并带有随机延迟
 */
async function* simulateTokenStream(text: string): AsyncGenerator<StreamEvent> {
  const chars = text.split('');
  let buffer = "";
  
  for (let i = 0; i < chars.length; i++) {
    buffer += chars[i];
    
    // 随机积累一些字符再发送，模拟 Token 概念 (1 token ~= 4 chars)
    if (Math.random() > 0.7 || i === chars.length - 1) {
      yield { type: AnalysisEventType.THOUGHT_DELTA, content: buffer };
      buffer = "";
      // 打字速度波动
      await sleep(Math.random() * 20 + 10); 
    }
  }
}
