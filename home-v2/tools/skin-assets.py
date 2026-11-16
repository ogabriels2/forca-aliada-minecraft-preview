from pathlib import Path
from PIL import Image,PngImagePlugin
root=Path(__file__).resolve().parents[1]
for name in ['ocean','plum','explorer']:
    texture=Image.open(root.parent/'assets/skins/steve.png').convert('RGBA')
    texture.alpha_composite(Image.frombytes('RGBA',(64,64),(root/'.impeccable/review'/f'skin-layer-{name}.rgba').read_bytes()))
    layers=texture.copy()
    for box,xy in [((32,0,64,16),(0,0)),((16,32,40,48),(16,16)),((40,32,56,48),(40,16)),((48,48,64,64),(32,48)),((0,32,16,48),(0,16)),((0,48,16,64),(16,48))]:
        texture.alpha_composite(layers.crop(box),xy)
    info=PngImagePlugin.PngInfo()
    info.add_text('Source',f'Existing catalog assets: assets/skins/steve.png with the authored SAMPLE_PARTS in skin-parts.mjs, look {name}. Deterministically composed for an illustrative product preview; no generative imagery.')
    texture.save(root/'media'/f'skin-texture-{name}.png',pnginfo=info)
    front=Image.new('RGBA',(24,32))
    for box,xy in [((8,8,16,16),(8,0)),((20,20,28,32),(8,8)),((44,20,48,32),(4,8)),((36,52,40,64),(16,8)),((4,20,8,32),(8,20)),((20,52,24,64),(12,20))]:
        front.alpha_composite(texture.crop(box),xy)
    front.resize((192,256),Image.Resampling.NEAREST).save(root/'media'/f'skin-{name}.png',pnginfo=info)
