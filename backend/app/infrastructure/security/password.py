import bcrypt
from app.infrastructure.config.settings import get_settings

settings = get_settings()


class PasswordHasher:
    def __init__(self, rounds: int = None):
        self._rounds = rounds or settings.BCRYPT_ROUNDS

    def hash(self, password: str) -> str:
        salt = bcrypt.gensalt(rounds=self._rounds)
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False
