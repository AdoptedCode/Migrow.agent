export const LOGGING_WEBHOOK_URL = "https://balzzzz.app.n8n.cloud/webhook-test/a953ddb1-65bf-499e-a29f-a0f95f74d292";

export const PYTHON_CODE_TEMPLATE = `import requests
import datetime
import json

# ==============================================================================
# CONFIGURATION
# ==============================================================================
# NOTE: This module is for LOGGING ONLY. It contains NO AGENT LOGIC.
# The Python agent remains the source of truth. n8n is strictly a pipeline.

# Single Webhook for all agent data
WEBHOOK_URL = "${LOGGING_WEBHOOK_URL}"

def _send_webhook(data: dict, log_type: str):
    """
    Helper to send data to n8n. 
    Injects 'log_type' so n8n can route to the correct Sheet/Table.
    """
    try:
        payload = data.copy()
        payload['log_type'] = log_type
        
        # Timeout ensures the agent doesn't hang if n8n is slow
        response = requests.post(WEBHOOK_URL, json=payload, timeout=5)
        response.raise_for_status()
    except Exception as e:
        print(f"ERROR: Failed to send {log_type} log to n8n: {e}")

# ==============================================================================
# LOGGING FUNCTIONS
# ==============================================================================

def log_event(event: dict):
    """
    Sends event data to n8n for Google Sheets storage.
    """
    payload = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "merchant_id": event.get("merchant_id", "UNKNOWN"),
        "event_type": event.get("event_type", "UNKNOWN"),
        "error": event.get("error", ""),
        "migration_stage": event.get("migration_stage", "UNKNOWN")
    }
    _send_webhook(payload, "EVENT")

def log_memory(issue_key: str, count: int, status: str):
    """
    Sends memory updates to n8n.
    """
    payload = {
        "issue_key": issue_key,
        "count": count,
        "status": status,
        "last_updated": datetime.datetime.utcnow().isoformat()
    }
    _send_webhook(payload, "MEMORY")

def log_result(issue_key: str, belief: str, confidence: float, action: str, human_approval_required: bool):
    """
    Sends final agent decisions/results to n8n.
    """
    payload = {
        "issue_key": issue_key,
        "belief": belief,
        "confidence": confidence,
        "recommended_action": action,
        "human_approval_required": human_approval_required,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    _send_webhook(payload, "RESULT")

# ==============================================================================
# EXAMPLE USAGE (Agent Loop)
# ==============================================================================
if __name__ == "__main__":
    print("Agent starting cycle...")
    
    # 1. OBSERVE
    current_event = {
        "merchant_id": "M12345", 
        "event_type": "DATA_ANOMALY", 
        "migration_stage": "VALIDATION"
    }
    log_event(current_event)
    
    # 2. REASON & DECIDE (Simulated)
    issue_id = "ISSUE-99"
    
    # 3. ACT & LOG RESULTS
    log_memory(issue_id, count=1, status="OPEN")
    log_result(issue_id, "Data corruption", 0.95, "ROLLBACK", True)
    
    print("Agent cycle complete. Logs sent.")
`;

// Mock Data for Dashboard
export const MOCK_EVENTS = [
  { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), merchant_id: "M-8392", event_type: "SCHEMA_VALIDATION", migration_stage: "PRE_CHECK", error: "" },
  { timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), merchant_id: "M-1120", event_type: "DATA_IMPORT", migration_stage: "EXECUTION", error: "Timeout" },
  { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), merchant_id: "M-8392", event_type: "SCHEMA_VALIDATION", migration_stage: "PRE_CHECK", error: "" },
  { timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), merchant_id: "M-4402", event_type: "POST_CHECK", migration_stage: "VERIFICATION", error: "" },
];

export const MOCK_RESULTS = [
  { timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), issue_key: "ISSUE-104", belief: "Invalid postal code format", confidence: 0.98, recommended_action: "AUTO_CORRECT", human_approval_required: false },
  { timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), issue_key: "ISSUE-103", belief: "Duplicate transaction ID detected", confidence: 0.85, recommended_action: "FLAG_FOR_REVIEW", human_approval_required: true },
  { timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), issue_key: "ISSUE-101", belief: "Missing tax ID", confidence: 0.99, recommended_action: "REQUEST_INFO", human_approval_required: false },
];