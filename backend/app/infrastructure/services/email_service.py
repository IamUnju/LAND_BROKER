import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import partial
import logging

from app.infrastructure.config.settings import get_settings

logger = logging.getLogger(__name__)


class EmailService:
    """
    Thin wrapper around smtplib for sending notification emails.
    If EMAILS_ENABLED is False or SMTP_HOST is empty, all sends are silently
    skipped so the app works with no email config.
    """

    def __init__(self):
        self._settings = get_settings()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _build_message(self, to_email: str, subject: str, html_body: str) -> MIMEMultipart:
        s = self._settings
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = s.SMTP_FROM or s.SMTP_USER
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))
        return msg

    def _send_sync(self, to_email: str, subject: str, html_body: str):
        s = self._settings
        if not s.EMAILS_ENABLED or not s.SMTP_HOST:
            logger.debug("Email sending skipped (EMAILS_ENABLED=False or SMTP_HOST empty).")
            return
        try:
            msg = self._build_message(to_email, subject, html_body)
            with smtplib.SMTP(s.SMTP_HOST, s.SMTP_PORT, timeout=10) as server:
                if s.SMTP_TLS:
                    server.starttls()
                if s.SMTP_USER and s.SMTP_PASSWORD:
                    server.login(s.SMTP_USER, s.SMTP_PASSWORD)
                sender = s.SMTP_FROM or s.SMTP_USER
                server.sendmail(sender, [to_email], msg.as_string())
                logger.info("Email sent to %s — %s", to_email, subject)
        except Exception as exc:
            logger.error("Failed to send email to %s: %s", to_email, exc)

    async def _send(self, to_email: str, subject: str, html_body: str):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, partial(self._send_sync, to_email, subject, html_body))

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    async def send_inquiry_notification(
        self,
        to_email: str,
        to_name: str,
        tenant_name: str,
        property_title: str,
        message: str,
    ):
        """Notify an owner or broker that a tenant submitted an inquiry."""
        subject = f"New Inquiry on \"{property_title}\""
        body = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
          <h2 style="color:#0b6f26;margin-top:0">New Property Inquiry</h2>
          <p>Hello <strong>{to_name}</strong>,</p>
          <p><strong>{tenant_name}</strong> has submitted an inquiry about
             <strong>{property_title}</strong>:</p>
          <blockquote style="border-left:4px solid #0b6f26;margin:16px 0;padding:12px 16px;background:#f0fdf4;border-radius:4px;color:#374151">
            {message}
          </blockquote>
          <p>Please log in to your dashboard to respond to this inquiry.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="font-size:12px;color:#9ca3af">This is an automated notification. Do not reply to this email.</p>
        </div>
        """
        await self._send(to_email, subject, body)

    async def send_inquiry_response(
        self,
        to_email: str,
        tenant_name: str,
        property_title: str,
        response: str,
    ):
        """Notify the tenant that their inquiry has received a response."""
        subject = f"Response to Your Inquiry – \"{property_title}\""
        body = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
          <h2 style="color:#0b6f26;margin-top:0">Your Inquiry Has Been Answered</h2>
          <p>Hello <strong>{tenant_name}</strong>,</p>
          <p>Your inquiry about <strong>{property_title}</strong> has received a response:</p>
          <blockquote style="border-left:4px solid #0b6f26;margin:16px 0;padding:12px 16px;background:#f0fdf4;border-radius:4px;color:#374151">
            {response}
          </blockquote>
          <p>Log in to your dashboard to view the full details and to ask any follow-up questions.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="font-size:12px;color:#9ca3af">This is an automated notification. Do not reply to this email.</p>
        </div>
        """
        await self._send(to_email, subject, body)
