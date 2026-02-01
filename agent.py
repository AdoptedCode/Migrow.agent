import json
from collections import defaultdict


# CATEGORIES


ISSUE_TYPES = [
    "merchant_config_error",
    "migration_issue",
    "platform_bug",
    "documentation_gap",
    "unknown"
]

MIGRATION_STAGES = [
    "pre_migration",
    "in_migration",
    "post_cutover",
    "stabilizing",
    "completed"
]

ACTIONS = [
    "draft_support_reply",
    "suggest_documentation_update",
    "escalate_to_engineering",
    "no_action"
]


# AGENT MEMORY 


# Tracks how often similar issues occur
issue_frequency = defaultdict(int)

# Tracks whether an issue pattern was already handled
issue_resolution_status = {}


# OBSERVE


def observe(event):
    """
    Normalize incoming events into an internal issue key.
    """
    issue_key = f"{event['error']}|{event['migration_stage']}"
    issue_frequency[issue_key] += 1
    return issue_key, issue_frequency[issue_key]

# VERIFY 

def verify_issue_status(issue_key):
    """
    Prevent repeated or unnecessary actions.
    """
    return issue_resolution_status.get(issue_key, "active")


# REASON


def reason(issue_key, count):
    """
    Determine likely root cause with confidence and evidence.
    """
    error, stage = issue_key.split("|")
    evidence = []

    if stage == "post_cutover" and count >= 3:
        belief = "migration_issue"
        confidence = 0.8
        evidence.append("Repeated failures after migration cutover")
        evidence.append("Multiple merchants affected")

    elif stage == "in_migration":
        belief = "merchant_config_error"
        confidence = 0.6
        evidence.append("Issue occurred during setup phase")

    elif stage == "completed":
        belief = "platform_bug"
        confidence = 0.5
        evidence.append("Migration completed but issue persists")

    else:
        belief = "unknown"
        confidence = 0.3
        evidence.append("Insufficient evidence")

    return belief, confidence, evidence


# DECIDE (GUARDRAILS)


def decide(belief, confidence):
    """
    Apply safety rules and determine next action.
    """
    if belief == "migration_issue" and confidence > 0.7:
        return "escalate_to_engineering", True

    if belief == "documentation_gap":
        return "suggest_documentation_update", False

    if belief == "merchant_config_error":
        return "draft_support_reply", False

    return "no_action", False


# ACT (SAFE)


def act(issue_key, action, requires_human_approval):
    """
    Execute or recommend an action.
    """
    print("ACTION:", action)
    print("Human approval required:", requires_human_approval)

    # Mark issue as handled to avoid repeated actions
    if action != "no_action":
        issue_resolution_status[issue_key] = "resolved"


# EXPLAIN (TRANSPARENCY)


def explain(belief, confidence, evidence):
    """
    Provide explainability output.
    """
    return {
        "belief": belief,
        "confidence": confidence,
        "evidence": evidence
    }


# AGENT LOOP


def agent_loop(event):
    issue_key, count = observe(event)

    status = verify_issue_status(issue_key)
    if status == "resolved":
        print("STATUS: Issue already resolved. No further action.\n")
        return

    belief, confidence, evidence = reason(issue_key, count)
    action, requires_human_approval = decide(belief, confidence)

    act(issue_key, action, requires_human_approval)

    explanation = explain(belief, confidence, evidence)
    print("EXPLANATION:", explanation)
    print("-" * 60)

# RUN AGENT


if __name__ == "__main__":
    with open("events.json") as f:
        events = json.load(f)

    for event in events:
        agent_loop(event)
