# -*- mode: python ; coding: utf-8 -*-

"""
Spec de build mais robusto para Windows:
- inclui submódulos dinâmicos
- coleta binários/dados de pyzbar (incluindo DLLs necessárias)
"""

from PyInstaller.utils.hooks import collect_data_files, collect_dynamic_libs, collect_submodules

block_cipher = None

hiddenimports = []
hiddenimports += collect_submodules("pyzbar")
hiddenimports += collect_submodules("cv2")

binaries = []
binaries += collect_dynamic_libs("pyzbar")

datas = []
datas += collect_data_files("pyzbar")

a = Analysis(
    ["main.py"],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="rotondaro-farm",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
