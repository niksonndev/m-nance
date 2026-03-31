# Bot Pix Android via USB (Python)

Esqueleto inicial de um bot funcional (sem OOP) para automação Android via USB, com detecção de QR Code na tela do PC e execução de pagamento Pix no app do banco.

## Pré-requisitos

- Python 3.10+
- ADB instalado e disponível no `PATH`
- USB Debugging ativado no Android
- Celular conectado por cabo USB e autorizado no prompt de depuração

## Como ativar USB Debugging no Android

1. Abra `Configurações > Sobre o telefone`.
2. Toque 7 vezes em `Número da versão` para habilitar opções de desenvolvedor.
3. Volte para `Configurações > Sistema > Opções do desenvolvedor` (o caminho pode variar por fabricante).
4. Ative `Depuração USB`.
5. Conecte o celular ao PC e aceite o prompt de autorização RSA.

## Instalação

```bash
pip install -r requirements.txt
python -m uiautomator2 init
```

## Inspeção de elementos do app (weditor)

```bash
python -m weditor
```

## Como rodar

1. Copie `.env.example` para `.env`.
2. Ajuste as variáveis conforme seu ambiente.
3. Execute:

```bash
python main.py
```

## Adaptar para outro banco

- Edite `BANK_PACKAGE` no arquivo `.env`.
- Edite os textos dos botões `BTN_*` em `bot/payment.py` para refletir o app alvo.

## Estrutura

```text
rotondaro-farm/
├── main.py
├── bot/
│   ├── __init__.py
│   ├── device.py
│   ├── screen.py
│   └── payment.py
├── config/
│   └── settings.py
├── .env.example
├── requirements.txt
└── README.md
```
