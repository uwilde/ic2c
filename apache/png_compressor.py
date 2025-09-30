import os
from PIL import Image

def compress_png(file_path, overwrite=True, optimize_level=9):
    """
    Compress a PNG image using Pillow.
    :param file_path: Path to the PNG file.
    :param overwrite: If True, overwrite the original file. If False, create a new file with '_compressed' suffix.
    :param optimize_level: Compression level (0-9). 9 = max compression.
    """
    try:
        img = Image.open(file_path)
        # Ensure image is in a format that supports saving as PNG
        img = img.convert("RGBA")

        # Determine output path
        if overwrite:
            output_path = file_path
        else:
            base, ext = os.path.splitext(file_path)
            output_path = f"{base}_compressed{ext}"

        img.save(output_path, format="PNG", optimize=True, compress_level=optimize_level)
        print(f"Compressed: {file_path} → {output_path}")

    except Exception as e:
        print(f"Error compressing {file_path}: {e}")


def compress_all_pngs(root_dir=None, overwrite=True, optimize_level=9):
    """
    Walk through all subdirectories and compress PNG files.
    :param root_dir: Directory to start from. Defaults to script's directory.
    :param overwrite: Whether to overwrite original files.
    :param optimize_level: Compression level (0-9).
    """
    if root_dir is None:
        root_dir = os.path.dirname(os.path.abspath(__file__))

    for dirpath, _, filenames in os.walk(root_dir):
        for file in filenames:
            if file.lower().endswith(".png"):
                file_path = os.path.join(dirpath, file)
                compress_png(file_path, overwrite, optimize_level)


if __name__ == "__main__":
    # Adjust settings as needed
    compress_all_pngs(overwrite=True, optimize_level=9)
