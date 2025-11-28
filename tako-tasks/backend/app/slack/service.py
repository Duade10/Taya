import os
import json
import hmac
import hashlib
import time
from typing import Dict, Any
import requests
from fastapi import HTTPException

SLACK_CLIENT_ID = os.getenv("SLACK_CLIENT_ID", "client_id")
SLACK_CLIENT_SECRET = os.getenv("SLACK_CLIENT_SECRET", "client_secret")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "signing_secret")
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8000")
SLACK_REDIRECT_URI = f"{APP_BASE_URL}/slack/oauth/callback"

SCOPES = [
    "commands",
    "chat:write",
    "chat:write.public",
    "users:read",
    "team:read",
]


def build_install_url() -> str:
    scope = "%20".join(SCOPES)
    return (
        f"https://slack.com/oauth/v2/authorize?client_id={SLACK_CLIENT_ID}"
        f"&scope={scope}&user_scope=&redirect_uri={SLACK_REDIRECT_URI}"
    )


def exchange_code(code: str) -> Dict[str, Any]:
    resp = requests.post(
        "https://slack.com/api/oauth.v2.access",
        data={
            "client_id": SLACK_CLIENT_ID,
            "client_secret": SLACK_CLIENT_SECRET,
            "code": code,
            "redirect_uri": SLACK_REDIRECT_URI,
        },
        timeout=10,
    )
    data = resp.json()
    if not data.get("ok"):
        raise HTTPException(status_code=400, detail=data.get("error", "Slack auth failed"))
    return data


def verify_slack_request(timestamp: str, signature: str, body: str) -> bool:
    if abs(time.time() - int(timestamp)) > 60 * 5:
        return False
    basestring = f"v0:{timestamp}:{body}".encode("utf-8")
    my_signature = "v0=" + hmac.new(
        SLACK_SIGNING_SECRET.encode("utf-8"), basestring, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(my_signature, signature)


def task_modal(trigger_id: str) -> Dict[str, Any]:
    return {
        "trigger_id": trigger_id,
        "view": {
            "type": "modal",
            "callback_id": "task_create",
            "title": {"type": "plain_text", "text": "Create Task"},
            "submit": {"type": "plain_text", "text": "Save"},
            "close": {"type": "plain_text", "text": "Cancel"},
            "blocks": [
                {
                    "type": "input",
                    "block_id": "title_block",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "title_input",
                        "placeholder": {"type": "plain_text", "text": "Add summary"},
                    },
                    "label": {"type": "plain_text", "text": "Title"},
                },
                {
                    "type": "input",
                    "block_id": "description_block",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "description_input",
                        "multiline": True,
                    },
                    "label": {"type": "plain_text", "text": "Description"},
                },
                {
                    "type": "input",
                    "block_id": "assignee_block",
                    "element": {
                        "type": "users_select",
                        "action_id": "assignee_input",
                    },
                    "label": {"type": "plain_text", "text": "Assignee"},
                },
                {
                    "type": "input",
                    "block_id": "due_block",
                    "optional": True,
                    "element": {
                        "type": "datepicker",
                        "action_id": "due_input",
                    },
                    "label": {"type": "plain_text", "text": "Due date"},
                },
                {
                    "type": "input",
                    "block_id": "priority_block",
                    "element": {
                        "type": "static_select",
                        "action_id": "priority_input",
                        "options": [
                            {
                                "text": {"type": "plain_text", "text": label},
                                "value": label.lower(),
                            }
                            for label in ["Low", "Normal", "High", "Urgent"]
                        ],
                        "initial_option": {
                            "text": {"type": "plain_text", "text": "Normal"},
                            "value": "normal",
                        },
                    },
                    "label": {"type": "plain_text", "text": "Priority"},
                },
                {
                    "type": "input",
                    "block_id": "tags_block",
                    "optional": True,
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "tags_input",
                        "placeholder": {"type": "plain_text", "text": "comma,separated"},
                    },
                    "label": {"type": "plain_text", "text": "Tags"},
                },
            ],
        },
    }


def task_message_blocks(task: Dict[str, Any]) -> list[Dict[str, Any]]:
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*{task['title']}*\n{task['description']}\n*Assignee:* <@{task['assignee_user_id']}>",
            },
        },
        {
            "type": "context",
            "elements": [
                {"type": "mrkdwn", "text": f"Priority: {task['priority']}"},
                {"type": "mrkdwn", "text": f"Status: {task['status']}"},
                {"type": "mrkdwn", "text": f"Due: {task.get('due_date', 'n/a')}"},
            ],
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "✔ Mark Complete"},
                    "style": "primary",
                    "value": json.dumps({"action": "complete", "task_id": task["id"]}),
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "🔄 Update Status"},
                    "value": json.dumps({"action": "status", "task_id": task["id"]}),
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "🗂 Reassign"},
                    "value": json.dumps({"action": "reassign", "task_id": task["id"]}),
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "📝 Edit"},
                    "value": json.dumps({"action": "edit", "task_id": task["id"]}),
                },
            ],
        },
    ]
