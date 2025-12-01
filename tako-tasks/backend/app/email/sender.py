import os
import smtplib
from email.message import EmailMessage

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS", "").strip()
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "").strip()
GMAIL_FROM_NAME = os.getenv("GMAIL_FROM_NAME", "Tako Tasks")


PLACEHOLDER_VALUES = {
    "GMAIL_ADDRESS": {"your-gmail-address@example.com"},
    "GMAIL_APP_PASSWORD": {"your-gmail-app-password"},
}


def _validate_value(name: str, value: str) -> str | None:
    if not value:
        return f"{name} is missing; set it in your environment (e.g., .env)."
    if value in PLACEHOLDER_VALUES.get(name, set()):
        return f"{name} is still using the placeholder value; replace it with your real Gmail setting."
    if name == "GMAIL_ADDRESS" and "@" not in value:
        return "GMAIL_ADDRESS must be a valid Gmail address."
    if name == "GMAIL_APP_PASSWORD" and len(value) < 16:
        return "GMAIL_APP_PASSWORD looks too short; use the 16-character app password from Google."
    return None


def _validate_gmail_config() -> None:
    errors = [
        error
        for error in (
            _validate_value("GMAIL_ADDRESS", GMAIL_ADDRESS),
            _validate_value("GMAIL_APP_PASSWORD", GMAIL_APP_PASSWORD),
        )
        if error
    ]

    if errors:
        joined = "; ".join(errors)
        raise RuntimeError(
            f"Gmail configuration invalid: {joined} Gmail will not be called until this is fixed."
        )


def send_access_key_email(email: str, name: str, key: str) -> None:
    _validate_gmail_config()
    message = EmailMessage()
    message["Subject"] = "Your Tako Tasks access key"
    message["From"] = f"{GMAIL_FROM_NAME} <{GMAIL_ADDRESS}>"
    message["To"] = f"{name} <{email}>"

    html_body = f"""
        <p>Hi {name},</p>
        <p>Thanks for requesting access to Tako Tasks. Use the key below to unlock the Slack app:</p>
        <p><strong>{key}</strong></p>
        <p>This key is single-use. Enter it on the unlock page to continue.</p>
        <p>— Tako Tasks Team</p>
    """
    message.set_content(
        f"Hi {name},\n\n"
        "Thanks for requesting access to Tako Tasks. Use the key below to unlock the Slack app:\n"
        f"{key}\n\n"
        "This key is single-use. Enter it on the unlock page to continue.\n"
        "— Tako Tasks Team"
    )
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(message)
    except Exception as exc:  # pragma: no cover - log in production
        print(f"Failed to send email: {exc}")
