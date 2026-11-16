"""Read-only architectural extraction from the owned world snapshot.
No entities, inventories, sign text, player information or source regions are exported.
Only exposed, greedy-merged geometry and material colors ship to the browser.
"""
import sys,io,zlib,json,gzip,math,zipfile,hashlib
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0,'D:/fa-cover-work/python')
import nbtlib

ROOT=Path(__file__).resolve().parents[1]
WORLD=Path('D:/fa-cover-work/world-copy/region')
JAR=Path.home()/'AppData/Roaming/.minecraft/versions/26.3/26.3.jar'
OUT=ROOT/'media/world'
OUT.mkdir(parents=True,exist_ok=True)
PALETTE=['air']; ID={'air':0}; COLORS=[[0,0,0]]
pack=zipfile.ZipFile(JAR)
def block_color(name):
    k=name.split(':')[-1]
    replacements={'grass_block':'grass_block_top','dirt_path':'dirt_path_top','farmland':'dirt','snow':'snow','water':'water_still','lava':'lava_still','quartz_block':'quartz_block_side','smooth_quartz':'quartz_block_side','purpur_pillar':'purpur_pillar','chest':'oak_planks','barrel':'barrel_side'}
    texture=replacements.get(k,k)
    for suffix in ('_stairs','_slab','_wall','_fence','_fence_gate','_button','_pressure_plate'):
        if texture.endswith(suffix):
            texture=texture[:-len(suffix)]
            if texture in ['oak','spruce','birch','jungle','acacia','dark_oak','mangrove','cherry','bamboo','pale_oak']: texture+='_planks'
            elif texture in ['stone_brick','brick','deepslate_brick','deepslate_tile','mud_brick']:texture+='s'
    if texture.endswith('_wood'):texture=texture[:-5]+'_log'
    for t in (texture,texture+'_side',texture+'_top'):
        try:
            im=np.array(Image.open(io.BytesIO(pack.read('assets/minecraft/textures/block/'+t+'.png'))).convert('RGBA'))
            pixels=im[:im.shape[1],:,:]; good=pixels[:,:,3]>128
            col=pixels[:,:,:3][good].mean(axis=0) if good.any() else np.array([145,150,140])
            if 'grass' in k or 'fern' in k:col=col*np.array([.49,.74,.29])
            elif 'leaves' in k or 'vine' in k:col=col*np.array([.39,.68,.23])
            elif k=='water':col=np.array([47,137,173])
            return np.clip(col*1.06,0,255).astype(int).tolist()
        except KeyError:pass
    if 'glass' in k:return [135,182,188]
    if 'torch' in k or 'lantern' in k:return [244,180,74]
    if 'rail' in k:return [123,101,76]
    if 'wheat' in k:return [190,164,60]
    if 'flower' in k:return [188,114,137]
    return [144,149,128]
def block_id(p):
    name=str(p.get('Name',p.get('name',p.get('id',p.get('','minecraft:air'))))) if hasattr(p,'get') else str(p)
    k=name.split(':')[-1]
    if k in ('air','cave_air','void_air','barrier','structure_void','light') or any(t in k for t in ('sign','banner','portal')):return 0
    if name not in ID:
        ID[name]=len(PALETTE);PALETTE.append(name);COLORS.append(block_color(name))
    return ID[name]
def extract(name,bounds):
    x0,x1,z0,z1,y0,y1=bounds
    vox=np.zeros((x1-x0,y1-y0,z1-z0),dtype=np.uint16)
    opened={}
    for cx in range(x0//16,x1//16):
        for cz in range(z0//16,z1//16):
            key=(cx//32,cz//32)
            if key not in opened:
                f=(WORLD/f'r.{key[0]}.{key[1]}.mca').open('rb');opened[key]=(f,f.read(4096))
            f,h=opened[key];i=((cz%32)*32+cx%32)*4;offset=int.from_bytes(h[i:i+3],'big')
            if not offset:continue
            f.seek(offset*4096);n=int.from_bytes(f.read(4),'big');compression=f.read(1)
            if compression!=b'\x02':continue
            q=nbtlib.File.parse(io.BytesIO(zlib.decompress(f.read(n-1))))
            for s in q.get('sections',[]):
                sy=int(s['Y'])*16
                if sy<y0 or sy>=y1:continue
                bs=s.get('block_states')
                if not bs:continue
                pal=np.array([block_id(p) for p in bs['palette']],dtype=np.uint16)
                if len(pal)==1:a=np.full((16,16,16),pal[0],dtype=np.uint16)
                else:
                    bits=max(4,(len(pal)-1).bit_length());per=64//bits
                    data=np.array(bs['data'],dtype=np.int64).view(np.uint64)
                    ii=np.arange(4096);ids=(data[ii//per] >> ((ii%per)*bits).astype(np.uint64)) & ((1<<bits)-1)
                    a=pal[ids].reshape(16,16,16).transpose(2,0,1)
                vox[cx*16-x0:cx*16-x0+16,sy-y0:sy-y0+16,cz*16-z0:cz*16-z0+16]=a
    for f,_ in opened.values():f.close()
    print(name,'loaded',vox.shape,'materials',len(PALETTE),flush=True)
    # Each record is 8 uint16: origin xyz, extents uv, normal axis/sign, material.
    # Greedy merging retains every boundary while reducing coplanar faces.
    faces=[]
    for axis in range(3):
        u=(axis+1)%3;v=(axis+2)%3
        data=vox.transpose(axis,u,v)
        for sign in (-1,1):
            for d in range(data.shape[0]):
                surface=data[d]
                neighbor=data[d+sign] if 0<=d+sign<data.shape[0] else np.zeros_like(surface)
                mask=np.where((surface!=0)&(neighbor==0),surface,0).copy()
                for row in range(mask.shape[0]):
                    col=0
                    while col<mask.shape[1]:
                        material=int(mask[row,col])
                        if not material:col+=1;continue
                        end=col+1
                        while end<mask.shape[1] and mask[row,end]==material:end+=1
                        bottom=row+1
                        while bottom<mask.shape[0] and np.all(mask[bottom,col:end]==material):bottom+=1
                        origin=[0,0,0];origin[axis]=d+(1 if sign>0 else 0);origin[u]=row;origin[v]=col
                        faces.append(origin+[bottom-row,end-col,axis,1 if sign>0 else 0,material])
                        mask[row:bottom,col:end]=0;col=end
            print(name,'meshed',axis,sign,len(faces),flush=True)
    binary=np.array(faces,dtype='<u2').tobytes()
    gz=gzip.compress(binary,compresslevel=9,mtime=0)
    (OUT/f'{name}.bin.gz').write_bytes(gz)
    meta={'version':1,'name':name,'bounds':bounds,'faceCount':len(faces),'stride':8,'colors':COLORS,'origin':'Força Aliada owned Minecraft world, architectural snapshot, no player data; material colors sampled locally. Geometry simplified to block faces.','sha256':hashlib.sha256(binary).hexdigest()}
    (OUT/f'{name}.json').write_text(json.dumps(meta,separators=(',',':')),encoding='utf8')
    print(name,'complete',len(faces),'faces, compressed MB',round(len(gz)/1e6,2),flush=True)
    # A top-down inspection map derived from the exact extracted volume.
    h=(vox!=0).shape[1]-1-np.argmax((vox!=0)[:,::-1,:],axis=1)
    surface=vox[np.arange(vox.shape[0])[:,None],h,np.arange(vox.shape[2])[None,:]]
    im=np.array(COLORS,dtype=np.uint8)[surface].transpose(1,0,2)
    Image.fromarray(im).save(ROOT/'.impeccable/review'/f'{name}-map.png')
if __name__=='__main__':
    scenes={'central':[-448,96,-64,480,48,192],'cidade-dois':[-192,320,592,1104,48,192]}
    for name in sys.argv[1:] or scenes:extract(name,scenes[name])
