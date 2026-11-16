"""Encode delivery variants from owned assets; preserve the original framing."""
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parent.parent/'media'
for name,widths,quality in [
    ('forca-aliada-coliseu',[480,800,1280],82),
    ('hero',[480,800],80),
    ('galeria19',[480,800],82),
    ('app-overview-1440',[480,960],88),
]:
    with Image.open(root/f'{name}.webp') as image:
        for width in widths:
            height=round(image.height*width/image.width)
            target=root/f'{name}-{width}.webp'
            image.resize((width,height),Image.Resampling.LANCZOS).save(target,format='WEBP',quality=quality,method=6)
            print(target.name,target.stat().st_size)
with Image.open(root/'fa-icon-dark.png') as image:
    image.resize((64,64),Image.Resampling.LANCZOS).save(root/'fa-icon-64.webp',format='WEBP',lossless=True,method=6)
