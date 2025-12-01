import os

from mailjet_rest import Client

MAILJET_API_KEY = os.getenv("MAILJET_API_KEY", "").strip()
MAILJET_API_SECRET = os.getenv("MAILJET_API_SECRET", "").strip()
MAILJET_FROM_EMAIL = os.getenv("MAILJET_FROM_EMAIL", "").strip()
MAILJET_FROM_NAME = os.getenv("MAILJET_FROM_NAME", "Tako Tasks")


PLACEHOLDER_VALUES = {
    "MAILJET_API_KEY": {"mailjet-key", "your-mailjet-api-key"},
    "MAILJET_API_SECRET": {"mailjet-secret", "your-mailjet-api-secret"},
    "MAILJET_FROM_EMAIL": {"noreply@tako-tasks.com", "your-verified-mailjet-sender@example.com"},
}


def _validate_value(name: str, value: str) -> str | None:
    if not value:
        return f"{name} is missing; set it in your environment (e.g., .env)."
    if value in PLACEHOLDER_VALUES.get(name, set()):
        return f"{name} is still using the placeholder value; replace it with your real Mailjet setting."
    if name == "MAILJET_FROM_EMAIL" and "@" not in value:
        return "MAILJET_FROM_EMAIL must be a valid email address that is verified in Mailjet."
    return None


def _validate_mailjet_config() -> None:
    errors = [
        error
        for error in (
            _validate_value("MAILJET_API_KEY", MAILJET_API_KEY),
            _validate_value("MAILJET_API_SECRET", MAILJET_API_SECRET),
            _validate_value("MAILJET_FROM_EMAIL", MAILJET_FROM_EMAIL),
        )
        if error
    ]

    if errors:
        joined = "; ".join(errors)
        raise RuntimeError(
            f"Mailjet configuration invalid: {joined} Mailjet will not be called until this is fixed."
        )


def send_access_key_email(email: str, name: str, key: str) -> None:
    _validate_mailjet_config()
    client = Client(auth=(MAILJET_API_KEY, MAILJET_API_SECRET))
    body = {
        "Messages": [
            {
                "From": {"Email": MAILJET_FROM_EMAIL, "Name": MAILJET_FROM_NAME},
                "To": [{"Email": email, "Name": name}],
                "Subject": "Your Tako Tasks access key",
                "HTMLPart": f"""
                    <p>Hi {name},</p>
                    <p>Thanks for requesting access to Tako Tasks. Use the key below to unlock the Slack app:</p>
                    <p><strong>{key}</strong></p>
                    <p>This key is single-use. Enter it on the unlock page to continue.</p>
                    <p>— Tako Tasks Team</p>
                """,
            }
        ]
    }
    try:
        response = client.send.create(data=body)
        if response.status_code >= 400:  # pragma: no cover - log in production
            try:
                details = response.json()
            except ValueError:
                details = response.text
            print(f"Failed to send email: {response.status_code} {details}")
    except Exception as exc:  # pragma: no cover - log in production
        print(f"Failed to send email: {exc}")
