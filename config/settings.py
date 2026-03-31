"""Configurações carregadas do arquivo .env."""

from dotenv import load_dotenv
import os

load_dotenv()

BANK_PACKAGE: str = os.getenv("BANK_PACKAGE", "br.com.nu")
MONITOR_INDEX: int = int(os.getenv("MONITOR_INDEX", "1"))
QR_SCAN_INTERVAL: float = float(os.getenv("QR_SCAN_INTERVAL", "0.5"))
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
