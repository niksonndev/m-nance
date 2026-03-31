"""Funções para conectar e navegar no dispositivo Android."""

from __future__ import annotations

import logging
import subprocess
from typing import Any

import uiautomator2 as u2


def connect() -> Any:
    """Conecta no primeiro dispositivo Android via USB."""
    try:
        result = subprocess.run(
            ["adb", "devices"],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("ADB não encontrado no PATH do sistema.") from exc
    except subprocess.CalledProcessError as exc:
        raise RuntimeError("Falha ao listar dispositivos com 'adb devices'.") from exc

    serials: list[str] = []
    for line in result.stdout.splitlines()[1:]:
        if "\tdevice" not in line:
            continue
        serial = line.split("\t", maxsplit=1)[0].strip()
        if serial and not serial.startswith("emulator-"):
            serials.append(serial)

    if not serials:
        raise RuntimeError(
            "Nenhum dispositivo USB encontrado. Verifique cabo, USB Debugging e 'adb devices'."
        )

    serial = serials[0]
    device = u2.connect(serial)
    logging.info("Dispositivo conectado via USB: %s", serial)
    return device


def unlock_screen(device: Any) -> None:
    """Desbloqueia a tela enviando o keyevent 82."""
    logging.info("Desbloqueando tela do dispositivo")
    device.shell("input keyevent 82")


def open_app(device: Any, package: str) -> None:
    """Abre o app do banco e aguarda carregamento inicial."""
    logging.info("Abrindo aplicativo: %s", package)
    device.app_start(package, wait=True)
    loaded = device.app_wait(package, timeout=2.0)
    if not loaded:
        raise TimeoutError(f"Aplicativo '{package}' não carregou dentro de 2 segundos.")


def wait_and_click(
    device: Any,
    text: str | None = None,
    resource_id: str | None = None,
    timeout: float = 10,
) -> None:
    """Espera um elemento aparecer e clica nele."""
    if text is None and resource_id is None:
        raise ValueError("Informe 'text' ou 'resource_id' para localizar o elemento.")

    selector_kwargs: dict[str, str] = {}
    if text is not None:
        selector_kwargs["text"] = text
    if resource_id is not None:
        selector_kwargs["resourceId"] = resource_id

    logging.info("Aguardando elemento %s", selector_kwargs)
    selector = device(**selector_kwargs)
    found = selector.wait(timeout=timeout)
    if not found:
        raise TimeoutError(
            f"Timeout ao esperar elemento {selector_kwargs} por {timeout} segundos."
        )

    selector.click()
    logging.info("Clique realizado em %s", selector_kwargs)
