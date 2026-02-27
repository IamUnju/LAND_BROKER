from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from fastapi import HTTPException, status
from app.infrastructure.config.settings import get_settings

settings = get_settings()


class JWTService:
    def __init__(self):
        self._secret = settings.SECRET_KEY
        self._algorithm = settings.JWT_ALGORITHM
        self._access_expire = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self._refresh_expire = settings.REFRESH_TOKEN_EXPIRE_DAYS

    def create_access_token(self, subject: str, extra: Optional[Dict[str, Any]] = None) -> str:
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=self._access_expire)
        payload = {
            "sub": subject,
            "iat": now,
            "exp": expire,
            "type": "access",
        }
        if extra:
            payload.update(extra)
        return jwt.encode(payload, self._secret, algorithm=self._algorithm)

    def create_refresh_token(self, subject: str) -> str:
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=self._refresh_expire)
        payload = {
            "sub": subject,
            "iat": now,
            "exp": expire,
            "type": "refresh",
        }
        return jwt.encode(payload, self._secret, algorithm=self._algorithm)

    def decode_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, self._secret, algorithms=[self._algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def get_subject(self, token: str) -> str:
        payload = self.decode_token(token)
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
        return sub
