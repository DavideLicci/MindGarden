import os
from pathlib import Path
import sys

base = Path(__file__).resolve().parent.parent
src = base / 'design' / 'wireframes'
out = base / 'design' / 'wireframes' / 'png'

out.mkdir(parents=True, exist_ok=True)

try:
    import cairosvg
except Exception as e:
    print("Error: could not import 'cairosvg'. Make sure the Python package is installed:")
    print("    python -m pip install cairosvg")
    print(f"Import error: {e}")
    sys.exit(2)

def print_windows_cairo_instructions():
    print("\nCairo native runtime not found. On Windows the easiest option is to install MSYS2 and the mingw-w64 Cairo package.")
    print("Follow these steps in an elevated PowerShell (or regular PowerShell if MSYS2 already installed):\n")
    print("1) Install MSYS2 (if not installed):")
    print("   - Download and run installer: https://www.msys2.org/ and follow the 'Installation' section.")
    print("2) Open 'MSYS2 MSYS' or 'MSYS2 MinGW 64-bit' shell and update packages:")
    print("   pacman -Syu")
    print("3) Install the mingw-w64 Cairo runtime and gtk dependencies for 64-bit Python environments:")
    print("   pacman -S mingw-w64-x86_64-cairo mingw-w64-x86_64-pango mingw-w64-x86_64-gdk-pixbuf")
    print("4) Add the MSYS2 mingw64 bin folder to your PATH for the current PowerShell session (adjust path if MSYS2 installed elsewhere):")
    print("   $env:Path = 'C:/msys64/mingw64/bin;' + $env:Path")
    print("5) Close and re-open your PowerShell or ensure PATH is visible to the Python process, then reinstall/verify cairosvg requirements:")
    print("   python -m pip install --upgrade pip setuptools cairosvg tinycss2 cairocffi")
    print("6) Re-run this script. If you still see errors, ensure 'libcairo-2.dll' is present in the PATH and visible to Python.\n")

for svg in src.glob('*_lowfi.svg'):
    name = svg.stem
    png_path = out / f"{name}.png"
    try:
        cairosvg.svg2png(url=str(svg), write_to=str(png_path), output_width=1600)
        print(f"Exported {png_path}")
    except Exception as e:
        msg = str(e)
        print(f"Failed to export {svg}:")
        print(msg)
        # Detect common cairosvg/cairocffi native library error on Windows
        if 'no library called' in msg or 'cannot load library' in msg or 'libcairo-2.dll' in msg.lower():
            print_windows_cairo_instructions()
            sys.exit(3)
        else:
            print('\nIf this is a cairosvg/cairo error on Windows, try installing MSYS2 and the mingw-w64 cairo packages.')
            sys.exit(4)
