"""Fluxo funcional de pagamento Pix via app bancário."""

from __future__ import annotations

import logging
from typing import Any, Callable

from bot.device import open_app, unlock_screen, wait_and_click
from config.settings import BANK_PACKAGE

BTN_PIX = "Pix"
BTN_PAGAR = "Pagar"
BTN_COPIA_COLA = "Pix Copia e Cola"
BTN_CONFIRMAR = "Confirmar"


def _run_step(step_name: str, action: Callable[[], None]) -> None:
    """Executa uma etapa e relança erro com log claro."""
    try:
        logging.info("Iniciando etapa: %s", step_name)
        action()
    except Exception as exc:
        logging.exception("Erro na etapa '%s': %s", step_name, exc)
        raise


def pay(device: Any, payload: str) -> None:
    """Executa o fluxo completo para pagamento via Pix Copia e Cola."""
    _run_step("desbloquear tela", lambda: unlock_screen(device))
    _run_step("abrir app do banco", lambda: open_app(device, BANK_PACKAGE))
    _run_step("clicar em Pix", lambda: wait_and_click(device, text=BTN_PIX))
    _run_step("clicar em Pagar", lambda: wait_and_click(device, text=BTN_PAGAR))
    _run_step(
        "clicar em Pix Copia e Cola",
        lambda: wait_and_click(device, text=BTN_COPIA_COLA),
    )

    def _colar_payload() -> None:
        logging.info("Copiando payload para área de transferência do dispositivo")
        device.set_clipboard(payload)
        device.shell("input keyevent 279")

    _run_step("colar payload do QR", _colar_payload)
    _run_step(
        "confirmar pagamento",
        lambda: wait_and_click(device, text=BTN_CONFIRMAR),
    )
    logging.info("Fluxo de pagamento finalizado com sucesso")
