#!/usr/bin/env python3
"""Re-rig the supplied white-glove GLB for the landing hero's hands.

The source model (Tripo export) carries a full-body Mixamo skeleton whose
weights pull the hand toward head/leg bones, and an unshared triangle soup.
This script welds it, re-orients it (fingers +Y, palm +Z, thumb +X, cuff
centre at the origin), scales cuff→middle fingertip to 1.95 units, detects
each digit's axis, builds a 16-bone finger chain with smooth two-bone
weights, and writes:

  public/landing/models/glove.bin   float32 positions, u8 skin index,
                                    u8 normalised skin weight, u16 indices
  src/app/_landing/scenes/gloveRig.ts  bone rest positions and curl axes

Usage: python3 scripts/rig_glove.py "path/to/white glove hand 3d model.glb"
Requires numpy.
"""
import json, struct, sys
import numpy as np

src = sys.argv[1]
f = open(src, "rb").read()
clen, _ = struct.unpack("<I4s", f[12:20])
j = json.loads(f[20:20 + clen])
off = 20 + clen
blen, _ = struct.unpack("<I4s", f[off:off + 8])
b = f[off + 8:off + 8 + blen]

def acc(i):
    a = j["accessors"][i]; bv = j["bufferViews"][a["bufferView"]]
    ct = {5126: np.float32, 5123: np.uint16, 5121: np.uint8, 5125: np.uint32}[a["componentType"]]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    return np.frombuffer(b, dtype=ct, count=a["count"] * n, offset=bv.get("byteOffset", 0) + a.get("byteOffset", 0)).reshape(a["count"], n)

pr = j["meshes"][0]["primitives"][0]
P = acc(pr["attributes"]["POSITION"]).astype(np.float64)
I = acc(pr["indices"]).ravel()
C = np.stack([P[:, 1], P[:, 0], -P[:, 2]], 1)
np.savez("/tmp/glove_canon.npz", C=C, I=I)

d=np.load("/tmp/glove_canon.npz"); C=d["C"]; I=d["I"].astype(np.int64)
q=np.round(C/1e-4).astype(np.int64)
_,first,inv=np.unique(q,axis=0,return_index=True,return_inverse=True); inv=inv.ravel()
V=C[first].copy(); T=inv[I].reshape(-1,3)
# origin at the cuff centre, then scale so wrist→middle tip ≈ 1.95 (the scenes' hand units)
cuff=V[V[:,1]<-0.38].mean(0); V-=cuff
S=1.95/(V[:,1].max()); V*=S
print('cuff',cuff,'scale',S,'bounds',V.min(0).round(2),V.max(0).round(2))
def P(x,y,z): return (np.array([x,y,z])-cuff)*S
# rough digit axes (canonical, pre-scale); refined below by PCA
rough={
 'index': (P(0.2,0.08,-0.1),P(0.34,0.39,-0.1)),
 'middle':(P(0.07,0.1,-0.1),P(0.1,0.49,-0.1)),
 'ring':  (P(-0.1,0.1,-0.1),P(-0.12,0.49,-0.1)),
 'pinky': (P(-0.22,-0.02,-0.1),P(-0.36,0.32,-0.1)),
 'thumb': (P(0.14,-0.22,-0.04),P(0.33,0.06,0.27)),
}
def seg(v,a,b):
    ab=b-a; L=np.linalg.norm(ab); u=ab/L
    t=((v-a)@u)/L; proj=a+np.outer(np.clip(t,0,1),ab)
    return t,np.linalg.norm(v-proj,axis=1)
names=list(rough); dist=[];ts=[]
for n in names:
    t,dd=seg(V,*rough[n]); ts.append(t); dist.append(dd)
dist=np.array(dist); ts=np.array(ts)
owner=dist.argmin(0); dmin=dist.min(0)
radius=0.13*S
digits={}
for k,n in enumerate(names):
    m=(owner==k)&(dmin<radius)&(ts[k]>0.15)
    pts=V[m]; c=pts.mean(0); u,s,vt=np.linalg.svd(pts-c); ax=vt[0]
    a,b=rough[n]
    if ax@(b-a)<0: ax=-ax
    proj=(V[(owner==k)&(dmin<radius)]-c)@ax
    tip=c+ax*proj.max()
    base=a  # keep the knuckle where the digit meets the palm
    digits[n]=(base,tip)
    print(n,'verts',m.sum(),'len',round(np.linalg.norm(tip-base),3))
# bones: root (wrist) + 3 per digit
bones=[{'name':'wrist','parent':-1,'pos':[0,0,0]}]
info=[]
palmN=np.array([0,0,1.0])
for n in names:
    base,tip=digits[n]; L=np.linalg.norm(tip-base); u=(tip-base)/L
    ratios=[0,0.42,0.72] if n!='thumb' else [0,0.45,0.76]
    ids=[]
    for r in ratios:
        p=base+u*L*r
        parent=0 if not ids else ids[-1]
        bones.append({'name':f'{n}{len(ids)}','parent':parent,'pos':p.round(5).tolist()}); ids.append(len(bones)-1)
    if n=='thumb':
        toward=np.array([-1.0,0.25,0.35]); toward/=np.linalg.norm(toward)
        axis=np.cross(u,toward)
    else:
        axis=np.cross(u,palmN)
    axis/=np.linalg.norm(axis)
    info.append({'digit':n,'bones':ids,'axis':axis.round(5).tolist(),'base':base.round(5).tolist(),'tip':tip.round(5).tolist(),'length':round(float(L),5),'ratios':ratios})
# weights
nv=len(V); SI=np.zeros((nv,4),np.uint8); SW=np.zeros((nv,4),np.float32)
SI[:,0]=0; SW[:,0]=1
sm=lambda e0,e1,x: np.clip((x-e0)/(e1-e0),0,1)**2*(3-2*np.clip((x-e0)/(e1-e0),0,1))
for k,(n,inf) in enumerate(zip(names,info)):
    base=np.array(inf['base']); tip=np.array(inf['tip']); L=inf['length']; u=(tip-base)/L
    t=((V-base)@u)/L; proj=base+np.outer(np.clip(t,0,1),tip-base); dd=np.linalg.norm(V-proj,axis=1)
    m=(owner==k)&(dmin<radius*1.15)&(t>-0.18)
    r=inf['ratios']; b=inf['bones']
    for vi in np.nonzero(m)[0]:
        tt=t[vi]; w=0.07
        # chain weights along the digit: root→b0 at the knuckle, then b0→b1, b1→b2
        cuts=[(0.0,0,b[0])]+[(r[i],b[i-1],b[i]) for i in (1,2)]
        lo,hi,a=0,b[0],sm(-0.16,0.06,tt)
        if tt< 0.0+0.06: pair=(0,b[0],sm(-0.16,0.06,tt))
        elif tt< r[1]+w: pair=(b[0],b[1],sm(r[1]-w,r[1]+w,tt))
        else: pair=(b[1],b[2],sm(r[2]-w,r[2]+w,tt))
        SI[vi]=[pair[0],pair[1],0,0]; SW[vi]=[1-pair[2],pair[2],0,0]
print('weighted digit verts',(SW[:,1]>0).sum())
rig={'bones':bones,'digits':info,'vertexCount':nv,'indexCount':int(T.size)}
# binary: positions f32*3, skinIndex u8*4, skinWeight u8*4 (normalized), indices u16
SWq=np.round(SW*255).astype(np.uint8); SWq[:,0]=255-SWq[:,1]
blob=V.astype(np.float32).tobytes()+SI.tobytes()+SWq.tobytes()+T.astype(np.uint16).ravel().tobytes()
open('public/landing/models/glove.bin','wb').write(blob); print('bytes',len(blob))

bones_ts = [[b_["name"], b_["parent"], *[round(x, 4) for x in b_["pos"]]] for b_ in rig["bones"]]
digits_ts = [{"digit": d["digit"], "bones": d["bones"], "axis": [round(x, 4) for x in d["axis"]]} for d in rig["digits"]]
print("bones", len(bones_ts), "write gloveRig.ts with:")
print(json.dumps({"vertices": rig["vertexCount"], "indices": rig["indexCount"], "bones": bones_ts, "digits": digits_ts}))
