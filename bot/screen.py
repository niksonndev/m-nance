"""Funções de captura e leitura de QR na tela do computador."""

from __future__ import annotations

import logging
from threading import Event
from typing import Callable

import cv2
import mss
import numpy as np
from PIL import Image
from pyzbar.pyzbar import ZBarSymbol, decode


def capture_screen(monitor_index: int) -> np.ndarray:
    """Captura a tela de um monitor e retorna como array numpy."""
    with mss.mss() as sct:
        monitor = sct.monitors[monitor_index]
        frame = np.array(sct.grab(monitor))
    return frame


def find_qr(image: np.ndarray) -> str | None:
    """Detecta e retorna o payload de um QR Code, se existir."""
    if image.ndim == 3 and image.shape[2] == 4:
        bgr = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
    elif image.ndim == 3:
        bgr = image
    else:
        bgr = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    processed = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )

    qr_codes = decode(Image.fromarray(processed), symbols=[ZBarSymbol.QRCODE])
    if not qr_codes:
        return None

    payload_bytes = qr_codes[0].data
    return payload_bytes.decode("utf-8", errors="ignore").strip() or None


def watch_for_qr(
    callback: Callable[[str], None], monitor_index: int, interval: float
) -> None:
    """Monitora a tela continuamente e dispara callback para QR novo."""
    stop_event = Event()
    last_payload: str | None = None

    while True:
        image = capture_screen(monitor_index)
        payload = find_qr(image)

        if payload is None:
            logging.info("Nenhum QR Code detectado no monitor %s", monitor_index)
        elif payload != last_payload:
            last_payload = payload
            logging.info("Novo QR Code detectado")
            callback(payload)
        else:
            logging.info("QR Code repetido ignorado")

        stop_event.wait(timeout=interval)
