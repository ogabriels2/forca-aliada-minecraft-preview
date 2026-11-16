from pathlib import Path
import markdown

root = Path(__file__).resolve().parent.parent
style = '''
@font-face{font-family:Manrope;src:url(media/manrope-latin.woff2)}
*{box-sizing:border-box}body{margin:0;background:#f7f8fa;color:#202428;font:15px/1.75 Manrope,system-ui,sans-serif}
header{background:#202428;color:white;padding:22px max(24px,calc((100% - 1120px)/2));display:flex;gap:30px;align-items:center}
header a{color:white}main{max-width:1168px;margin:auto;padding:48px 24px 80px}h1{font-size:clamp(30px,4vw,48px);line-height:1.15;letter-spacing:-.035em}h2{margin-top:52px;line-height:1.3}h3{margin-top:32px}a{color:#2959c6;text-underline-offset:3px}p,li{max-width:850px}code{background:#e6e9ee;border-radius:4px;padding:2px 5px;font-size:.9em}table{border-collapse:collapse;width:100%;font-size:13px;line-height:1.6}th,td{padding:14px;border:1px solid #dce1e6;text-align:left;vertical-align:top}th{background:#e8edf4}td{min-width:155px}th:first-child,td:first-child{min-width:125px}section.table-scroll{overflow:auto;margin:22px 0}hr{border:0;border-top:1px solid #d9dde1;margin-top:60px}a:focus-visible{outline:3px solid #3262d9;outline-offset:4px}@media(max-width:600px){header{font-size:13px;gap:16px}main{padding-top:28px}table{font-size:12px}}
'''
parts=[]
for name in ['DIRECAO-3.md','VALIDACAO-3.md']:
    content=markdown.markdown((root/name).read_text(encoding='utf-8-sig'),extensions=['tables','fenced_code'])
    content=content.replace('<table>','<section class="table-scroll" tabindex="0" aria-label="Tabela de comparação"><table>').replace('</table>','</table></section>')
    parts.append(content)
html=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Pesquisa e direção da home — Força Aliada</title><style>{style}</style></head><body><header><strong>Força Aliada</strong><a href="./">← Voltar à prévia</a></header><main>{'<hr>'.join(parts)}</main></body></html>'''
(root/'direcao.html').write_text(html,encoding='utf-8')
print('direcao.html atualizado')
