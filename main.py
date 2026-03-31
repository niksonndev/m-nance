"""Ponto de entrada do bot de automação Pix."""

from __future__ import annotations

import logging

from bot.device import connect
from bot.payment import pay
from bot.screen import watch_for_qr
from config.settings import LOG_LEVEL, MONITOR_INDEX, QR_SCAN_INTERVAL


def main() -> None:
    """Inicializa o bot e inicia monitoramento de QR Codes."""
    logging.basicConfig(
        format="%(asctime)s %(levelname)s %(message)s",
        level=LOG_LEVEL,
    )

    device = connect()
    processed: set[str] = set()

    def on_qr(payload: str) -> None:
        """Processa QR Code novo e dispara pagamento."""
        if payload in processed:
            logging.info("Payload já processado, ignorando")
            return

        processed.add(payload)
        try:
            pay(device, payload)
            logging.info("Pagamento concluído para payload detectado")
        except Exception as exc:
            logging.exception("Falha ao processar payload: %s", exc)

    watch_for_qr(on_qr, MONITOR_INDEX, QR_SCAN_INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Bot encerrado")
