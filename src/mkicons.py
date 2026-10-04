from PIL import Image, ImageDraw
def art(size, scale=1.0, full_bg=True):
    U=64
    img=Image.new('RGBA',(size,size),(23,35,42,255) if full_bg else (0,0,0,0))
    d=ImageDraw.Draw(img)
    k=size/U
    def R(x0,y0,x1,y1,c):
        # scale about centre
        cx=cy=U/2
        X0=cx+(x0-cx)*scale; X1=cx+(x1-cx)*scale; Y0=cy+(y0-cy)*scale; Y1=cy+(y1-cy)*scale
        d.rectangle([round(X0*k),round(Y0*k),round(X1*k)-1,round(Y1*k)-1],fill=c)
    # sky glow
    R(0,0,64,64,(23,35,42,255)) if full_bg else None
    R(6,46,58,54,(110,180,80)); R(6,54,58,59,(84,150,60))
    S=(198,204,209); SD=(154,161,168); ST=(224,228,231)
    # side towers
    R(13,30,23,46,S); R(19,30,23,46,SD); R(41,30,51,46,S); R(47,30,51,46,SD)
    for x in (13,17,21): R(x,26,x+3,30,ST)
    for x in (41,45,49): R(x,26,x+3,30,ST)
    # keep
    R(22,22,42,46,S); R(36,22,42,46,SD)
    for x in (22,28,34,39): R(x,18,x+4,22,ST)
    R(29,35,35,46,(74,47,28)); R(29,35,35,37,(120,80,45))
    R(30,27,34,32,(255,211,107))
    R(14,35,17,40,(255,211,107)); R(46,35,49,40,(255,211,107))
    # flag
    R(31,5,33,18,(140,100,60)); R(33,5,43,11,(228,112,43)); R(33,9,43,11,(190,90,30))
    return img
art(512,1.0).convert('RGBA').save('icons/icon-512.png')
art(192,1.0).save('icons/icon-192.png')
art(512,0.74).save('icons/icon-maskable-512.png')
art(180,0.9).convert('RGB').save('icons/apple-touch-icon.png')
art(256,1.0).resize((32,32),Image.LANCZOS).save('icons/favicon-32.png')
