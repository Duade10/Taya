import os

from mailjet_rest import Client

MAILJET_API_KEY = os.getenv("MAILJET_API_KEY", "mailjet-key")
MAILJET_API_SECRET = os.getenv("MAILJET_API_SECRET", "mailjet-secret")
MAILJET_FROM_EMAIL = os.getenv("MAILJET_FROM_EMAIL", "noreply@tako-tasks.com")
MAILJET_FROM_NAME = os.getenv("MAILJET_FROM_NAME", "Tako Tasks")


def send_access_key_email(email: str, name: str, key: str) -> None:
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
