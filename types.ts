export interface LogEvent {
  timestamp: string;
  merchant_id: string;
  event_type: string;
  error?: string;
  migration_stage: string;
}

export interface LogMemory {
  issue_key: string;
  count: number;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
  last_updated: string;
}

export interface LogResult {
  timestamp: string;
  issue_key: string;
  belief: string;
  confidence: number;
  recommended_action: string;
  human_approval_required: boolean;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  LOGS = 'LOGS',
  INTEGRATION = 'INTEGRATION',
}
