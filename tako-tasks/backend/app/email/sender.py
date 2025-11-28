import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "sendgrid-key")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@tako-tasks.com")


def send_access_key_email(email: str, name: str, key: str) -> None:
    message = Mail(
        from_email=SENDGRID_FROM_EMAIL,
        to_emails=email,
        subject="Your Tako Tasks access key",
        html_content=f"""
            <p>Hi {name},</p>
            <p>Thanks for requesting access to Tako Tasks. Use the key below to unlock the Slack app:</p>
            <p><strong>{key}</strong></p>
            <p>This key is single-use. Enter it on the unlock page to continue.</p>
            <p>— Tako Tasks Team</p>
        """,
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
    except Exception as exc:  # pragma: no cover - log in production
        print(f"Failed to send email: {exc}")
