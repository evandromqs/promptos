import http.server
import socketserver
import threading
import subprocess
import time
import os
import shutil
import zipfile
from PIL import Image

BASE_DIR = r'c:\Users\evand\OneDrive\Documents\promptos'
DIST_DIR = os.path.join(BASE_DIR, 'apps', 'extension', 'dist')
STORE_DIR = os.path.join(BASE_DIR, 'store-assets')
CHROME_BIN = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
PORT = 8931

os.makedirs(STORE_DIR, exist_ok=True)

# 1. Copiar ícone 128x128
src_icon = os.path.join(DIST_DIR, 'icons', 'icon-128.png')
dst_icon = os.path.join(STORE_DIR, 'icon-128.png')
shutil.copy2(src_icon, dst_icon)
print("[OK] Ícone copiado para:", dst_icon)

# 2. Servidor HTTP local para renderizar a extensão
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(('127.0.0.1', PORT), Handler)
server_thread = threading.Thread(target=httpd.serve_forever)
server_thread.daemon = True
server_thread.start()

def capture_url(url, output_path, width=1280, height=800):
    cmd = [
        CHROME_BIN,
        '--headless=new',
        '--hide-scrollbars',
        '--disable-gpu',
        '--force-device-scale-factor=1',
        f'--window-size={width},{height}',
        f'--screenshot={output_path}',
        url
    ]
    subprocess.run(cmd, capture_output=True, timeout=15)
    # Garantir que a imagem é 24-bit RGB (sem canal alfa)
    if os.path.exists(output_path):
        with Image.open(output_path) as im:
            rgb_im = im.convert('RGB')
            if rgb_im.size != (width, height):
                rgb_im = rgb_im.resize((width, height), Image.Resampling.LANCZOS)
            rgb_im.save(output_path, 'PNG')
            print(f"[OK] Gerado {os.path.basename(output_path)}: {rgb_im.size}, mode={rgb_im.mode}")

# Templates HTML para as 5 screenshots
screens = [
    {
        "filename": "screenshot-1-biblioteca.png",
        "tag": "ORGANIZAÇÃO INTELIGENTE",
        "title": "Biblioteca de Prompts<br>Sempre à Mão",
        "desc": "Acesse, crie e categorize todos os seus prompts favoritos direto no navegador, sem perder tempo procurando notas antigas.",
        "pills": [
            "Filtro rápido por categorias (Marketing, Código, Estudos)",
            "Busca instantânea em tempo real e lista de favoritos",
            "Painel lateral expansível perfeitamente integrado"
        ],
        "script": """
            // Deixar na tela inicial de prompts
        """
    },
    {
        "filename": "screenshot-2-variaveis.png",
        "tag": "TEMPLATES DINÂMICOS",
        "title": "Preencha Variáveis<br>em Poucos Segundos",
        "desc": "Crie modelos com tags personalizadas como {produto}, {público} e {tom}. O PromptOS monta o texto final automaticamente.",
        "pills": [
            "Detecção automática de variáveis no texto {nome}",
            "Campos de entrada organizados e intuitivos",
            "Copie o resultado ou insira direto na conversa"
        ],
        "script": """
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const frame = document.querySelector('iframe');
                    const fDoc = frame.contentDocument || frame.contentWindow.document;
                    const firstItem = fDoc.querySelector('.item-main');
                    if (firstItem) firstItem.click();
                    setTimeout(() => {
                        const inputs = fDoc.querySelectorAll('.variables-list input');
                        if (inputs[0]) { inputs[0].value = 'PromptOS para Chrome'; inputs[0].dispatchEvent(new Event('input', {bubbles:true})); }
                        if (inputs[1]) { inputs[1].value = 'Profissionais de IA e Redatores'; inputs[1].dispatchEvent(new Event('input', {bubbles:true})); }
                        if (inputs[2]) { inputs[2].value = 'Profissional e Persuasivo'; inputs[2].dispatchEvent(new Event('input', {bubbles:true})); }
                    }, 300);
                }, 500);
            });
        """
    },
    {
        "filename": "screenshot-3-workflows.png",
        "tag": "FLUXOS DE TRABALHO",
        "title": "Encadeie Prompts em<br>Workflows Sequenciais",
        "desc": "Transforme tarefas complexas em processos ordenados passo a passo: Pesquisar → Estruturar → Redigir → Revisar.",
        "pills": [
            "Etapas sequenciais e ordenáveis com facilidade",
            "Acompanhe o progresso de cada fase do projeto",
            "Reutilize fluxos completos para rotinas frequentes"
        ],
        "script": """
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const frame = document.querySelector('iframe');
                    const fDoc = frame.contentDocument || frame.contentWindow.document;
                    // Mockar um workflow
                    const wf = [{
                        id: 'wf-1',
                        title: 'Produção Completa de Artigo',
                        steps: ['starter-3', 'starter-1', 'starter-2'],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        chatUses: 14
                    }];
                    frame.contentWindow.localStorage.setItem('promptos.workflows.v1', JSON.stringify(wf));
                    const tabs = fDoc.querySelectorAll('.section-tabs button');
                    if (tabs[1]) tabs[1].click();
                }, 500);
            });
        """
    },
    {
        "filename": "screenshot-4-chatgpt.png",
        "tag": "INTEGRAÇÃO DIRETA",
        "title": "Inserção em 1 Clique<br>Direto no ChatGPT",
        "desc": "Transfira o prompt pronto diretamente para o campo de mensagem do ChatGPT sem precisar de copiar e colar manual.",
        "pills": [
            "Compatível com chatgpt.com e chat.openai.com",
            "Não envia sozinho: você mantém o controle total antes do envio",
            "Botão flutuante discreto para abrir e fechar a qualquer hora"
        ],
        "script": """
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const frame = document.querySelector('iframe');
                    const fDoc = frame.contentDocument || frame.contentWindow.document;
                    const firstItem = fDoc.querySelector('.item-main');
                    if (firstItem) firstItem.click();
                }, 500);
            });
        """
    },
    {
        "filename": "screenshot-5-privacidade-temas.png",
        "tag": "PRIVACIDADE & CONTROLE",
        "title": "100% Local, Privado<br>e Sem Servidores",
        "desc": "Seus dados nunca saem da sua máquina. Sem rastreamento, sem logins obrigatórios e com backup completo em JSON.",
        "pills": [
            "Exportação e restauração de backup com 1 clique",
            "Alternância dinâmica entre Modo Claro e Modo Escuro",
            "Totalmente compatível com as normas de privacidade da Google"
        ],
        "script": """
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const frame = document.querySelector('iframe');
                    const fDoc = frame.contentDocument || frame.contentWindow.document;
                    frame.contentWindow.localStorage.setItem('promptos.settings.v1', JSON.stringify({locale: 'pt', theme: 'dark', viewMode: 'list'}));
                    frame.contentWindow.document.documentElement.dataset.theme = 'dark';
                    const settingsBtn = fDoc.querySelector('button[title=\"Configurações\"]') || fDoc.querySelector('.topbar-actions button');
                    if (settingsBtn) settingsBtn.click();
                }, 500);
            });
        """
    }
]

for s in screens:
    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; padding: 0; background: #071220; display: flex; align-items: center; justify-content: center; width: 1280px; height: 800px; overflow: hidden; font-family: 'Montserrat', sans-serif; }}
  .canvas {{ width: 1280px; height: 800px; position: relative; background: radial-gradient(circle at 65% 35%, #18385a 0%, #0d1e34 50%, #060e1a 100%); display: flex; align-items: center; justify-content: space-between; padding: 50px 75px; }}
  
  /* Brilho decorativo no fundo */
  .glow {{ position: absolute; width: 450px; height: 450px; background: #326d9d; filter: blur(140px); opacity: 0.28; border-radius: 50%; right: 120px; top: 120px; pointer-events: none; }}
  
  .info {{ max-width: 530px; color: #fff; z-index: 2; }}
  .badge {{ display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; background: rgba(50, 109, 157, 0.25); border: 1px solid rgba(82, 112, 139, 0.55); border-radius: 999px; font-size: 13px; font-weight: 700; color: #8bc2eb; letter-spacing: 0.08em; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }}
  .badge-icon {{ width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8; }}
  
  h1 {{ font-family: 'Poppins', sans-serif; font-size: 42px; font-weight: 800; line-height: 1.18; margin: 0 0 18px 0; background: linear-gradient(135deg, #ffffff 40%, #bad8ef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }}
  p {{ font-size: 17px; line-height: 1.55; color: #b7cbde; margin: 0 0 32px 0; font-weight: 400; }}
  
  .pills {{ display: flex; flex-direction: column; gap: 14px; }}
  .pill {{ display: flex; align-items: center; gap: 14px; font-size: 15px; color: #eaf1f8; font-weight: 500; background: rgba(14, 28, 48, 0.6); padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); }}
  .pill-check {{ width: 22px; height: 22px; border-radius: 50%; background: #1f6498; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }}
  
  .frame-wrapper {{ position: relative; z-index: 2; }}
  .frame-container {{ width: 410px; height: 650px; border-radius: 20px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.15); background: #f5f7f9; }}
  iframe {{ width: 100%; height: 100%; border: none; }}
</style>
</head>
<body>
<div class="canvas">
  <div class="glow"></div>
  <div class="info">
    <div class="badge"><span class="badge-icon"></span>{s["tag"]}</div>
    <h1>{s["title"]}</h1>
    <p>{s["desc"]}</p>
    <div class="pills">
      <div class="pill"><span class="pill-check">✓</span>{s["pills"][0]}</div>
      <div class="pill"><span class="pill-check">✓</span>{s["pills"][1]}</div>
      <div class="pill"><span class="pill-check">✓</span>{s["pills"][2]}</div>
    </div>
  </div>
  <div class="frame-wrapper">
    <div class="frame-container">
      <iframe src="/index.html"></iframe>
    </div>
  </div>
</div>
<script>
{s["script"]}
</script>
</body>
</html>"""
    temp_html = os.path.join(DIST_DIR, 'temp_shot.html')
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    out_img = os.path.join(STORE_DIR, s["filename"])
    capture_url(f'http://127.0.0.1:{PORT}/temp_shot.html', out_img, 1280, 800)
    if os.path.exists(temp_html):
        os.remove(temp_html)

# 3. Gerar Bloco Promocional Pequeno (440 x 280)
small_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Poppins:wght@700;800&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; width: 440px; height: 280px; overflow: hidden; font-family: 'Montserrat', sans-serif; }
  .box { width: 440px; height: 280px; background: radial-gradient(circle at 50% 30%, #1e456e 0%, #0d1e34 60%, #060e1a 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; position: relative; }
  .icon-img { width: 68px; height: 68px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.15); margin-bottom: 14px; }
  h1 { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 6px 0; letter-spacing: -0.01em; }
  h1 span { color: #5aa9e6; }
  p { font-size: 13px; line-height: 1.4; color: #bad1e6; margin: 0; max-width: 340px; font-weight: 500; }
  .badge { margin-top: 14px; padding: 4px 12px; background: rgba(50, 109, 157, 0.35); border: 1px solid rgba(90, 169, 230, 0.4); border-radius: 999px; font-size: 11px; font-weight: 700; color: #8ec3ec; text-transform: uppercase; letter-spacing: 0.05em; }
</style>
</head>
<body>
<div class="box">
  <img src="/icons/icon-128.png" class="icon-img" alt="PromptOS">
  <h1>Prompt<span>OS</span></h1>
  <p>Organize, preencha e reutilize seus prompts no ChatGPT com 1 clique.</p>
  <div class="badge">Produtividade com IA</div>
</div>
</body>
</html>"""
temp_small = os.path.join(DIST_DIR, 'temp_small.html')
with open(temp_small, 'w', encoding='utf-8') as f:
    f.write(small_html)
out_small = os.path.join(STORE_DIR, 'promo-small-440x280.png')
capture_url(f'http://127.0.0.1:{PORT}/temp_small.html', out_small, 440, 280)
if os.path.exists(temp_small):
    os.remove(temp_small)

# 4. Gerar Bloco Promocional de Letreiro / Marquee (1400 x 560)
marquee_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; width: 1400px; height: 560px; overflow: hidden; font-family: 'Montserrat', sans-serif; }
  .marquee { width: 1400px; height: 560px; background: radial-gradient(circle at 60% 40%, #1e4570 0%, #0d1e34 50%, #060e1a 100%); display: flex; align-items: center; justify-content: space-between; padding: 40px 90px; position: relative; }
  .glow { position: absolute; width: 500px; height: 500px; background: #326d9d; filter: blur(150px); opacity: 0.35; border-radius: 50%; right: 200px; top: 30px; pointer-events: none; }
  .left { max-width: 680px; color: #fff; z-index: 2; }
  .brand-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
  .brand-logo { width: 64px; height: 64px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2); }
  .brand-title { font-family: 'Poppins', sans-serif; font-size: 34px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
  .brand-title span { color: #5aa9e6; }
  .brand-tag { font-size: 13px; font-weight: 700; color: #8ec3ec; background: rgba(50, 109, 157, 0.3); border: 1px solid rgba(82, 112, 139, 0.5); padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; }
  h1 { font-family: 'Poppins', sans-serif; font-size: 46px; font-weight: 800; line-height: 1.15; margin: 0 0 18px 0; background: linear-gradient(135deg, #ffffff 40%, #bad8ef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  p { font-size: 19px; line-height: 1.5; color: #b7cbde; margin: 0 0 28px 0; }
  .feature-row { display: flex; gap: 16px; }
  .feature-pill { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #eaf1f8; background: rgba(14, 28, 48, 0.7); padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); }
  .feature-pill span { color: #38bdf8; font-weight: bold; }
  .right { position: relative; z-index: 2; }
  .mini-frame { width: 340px; height: 460px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.15); background: #f5f7f9; }
  iframe { width: 100%; height: 100%; border: none; }
</style>
</head>
<body>
<div class="marquee">
  <div class="glow"></div>
  <div class="left">
    <div class="brand-header">
      <img src="/icons/icon-128.png" class="brand-logo" alt="PromptOS">
      <div class="brand-title">Prompt<span>OS</span></div>
      <div class="brand-tag">Extensão Oficial</div>
    </div>
    <h1>Seus prompts organizados.<br>Seus fluxos prontos para usar.</h1>
    <p>A ferramenta de produtividade essencial para quem usa ChatGPT profissionalmente todos os dias.</p>
    <div class="feature-row">
      <div class="feature-pill"><span>✓</span> Inserção em 1 Clique</div>
      <div class="feature-pill"><span>✓</span> Variáveis Dinâmicas</div>
      <div class="feature-pill"><span>✓</span> 100% Local & Privado</div>
    </div>
  </div>
  <div class="right">
    <div class="mini-frame">
      <iframe src="/index.html"></iframe>
    </div>
  </div>
</div>
</body>
</html>"""
temp_marquee = os.path.join(DIST_DIR, 'temp_marquee.html')
with open(temp_marquee, 'w', encoding='utf-8') as f:
    f.write(marquee_html)
out_marquee = os.path.join(STORE_DIR, 'promo-marquee-1400x560.png')
capture_url(f'http://127.0.0.1:{PORT}/temp_marquee.html', out_marquee, 1400, 560)
if os.path.exists(temp_marquee):
    os.remove(temp_marquee)

# Desligar servidor
httpd.shutdown()

# 5. Criar ZIP oficial da extensão (contendo os arquivos da pasta dist diretamente na raiz)
zip_path = os.path.join(STORE_DIR, 'promptos-v0.5.0-webstore.zip')
if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            # Não incluir temporários
            if file.startswith('temp_'):
                continue
            abs_file = os.path.join(root, file)
            rel_file = os.path.relpath(abs_file, DIST_DIR)
            zipf.write(abs_file, rel_file)

print(f"[OK] Pacote ZIP gerado: {zip_path} ({os.path.getsize(zip_path)} bytes)")

print("\\n--- TODOS OS ASSETS FORAM GERADOS COM SUCESSO! ---")
