import base64,re,json
src=open('index.src.html').read()
b64=lambda p: 'data:font/woff2;base64,'+base64.b64encode(open(p,'rb').read()).decode()
nm='node_modules/@fontsource-variable/'
src=src.replace('__FONT_INTER__',b64(nm+'inter/files/inter-latin-wght-normal.woff2'))
src=src.replace('__FONT_QUICK__',b64(nm+'quicksand/files/quicksand-latin-wght-normal.woff2'))
src=src.replace('__FONT_MONO__',b64(nm+'jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'))
logo=open('../../packages/ignition/public/rocketicons-logo.svg').read()
g=re.search(r'<g [^>]*aria-label="rocketicons">.*?</g>',logo,re.S).group(0)
paths=re.findall(r'<path fill="#38bdf8".*?/>|<path d="[^"]*" style="display:inline;fill:none;fill-opacity:1;stroke:#fff.*?/>',logo,re.S)
assert len(paths)==2
wave=paths[0].replace('<path ','<path id="lgWave" ',1).replace(' clip-path="url(#clipPath2)"','')
rocket=paths[1].replace('<path ','<path id="lgRocket" ',1)
src=src.replace('__LOGO_WORD__',g).replace('__LOGO_MARK__','<g id="lgWaveG">'+wave+'</g>'+rocket)
wave2=wave.replace('id="lgWave" ','')
rocket2=rocket.replace('id="lgRocket" ','').replace('stroke:#fff','stroke:currentColor').replace('stroke-width:1.16369','stroke-width:1.5')
rc=f'<svg viewBox="0 0 30.737 30.737" style="width:140px;height:140px;transform:rotate(45deg);overflow:visible">{wave2}{rocket2}</svg>'
src=src.replace('__RC_ROCKET__',rc)
src=src.replace('__GSAP__',open('node_modules/gsap/dist/gsap.min.js').read())
src=src.replace('__ICONS__',open('icons.json').read())
open('index.html','w').write(src)
print(len(src))
