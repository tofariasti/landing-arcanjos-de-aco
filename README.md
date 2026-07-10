# Arcanjos de Aço MC — 3 Versões de Landing Page

Três conceitos exclusivos de landing page para o motoclube **Arcanjos de Aço MC** de Rio das Ostras, RJ — com assets compartilhados do Instagram, hub de seleção e deploy automático no GitHub Pages.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://tofariasti.github.io/landing-arcanjos-de-aco/)

## Hub de apresentação

**Escolha entre as 3 versões:** [https://tofariasti.github.io/landing-arcanjos-de-aco/](https://tofariasti.github.io/landing-arcanjos-de-aco/)

| Versão | Conceito | URL |
|--------|----------|-----|
| V1 | **RAÇA** — Abutres-inspired, preloader, ticker, mapa territorial, masonry | [/v1-raca/](https://tofariasti.github.io/landing-arcanjos-de-aco/v1-raca/) |
| V2 | **TERRITÓRIO** — Split hero, mapa RJ interativo, timeline, carrossel IG | [/v2-territorio/](https://tofariasti.github.io/landing-arcanjos-de-aco/v2-territorio/) |
| V3 | **AÇO ESTRADA** — Ken Burns, chapter nav, filmstrip, CTAs cinematográficos | [/v3-aco-estrada/](https://tofariasti.github.io/landing-arcanjos-de-aco/v3-aco-estrada/) |

A versão antiga **"Asfalto Infinito"** (`site/`) foi arquivada e redireciona para o hub.

## Screenshots

### Desktop (1280px)
![Desktop view](screenshots/desktop.png)

### Tablet (768px)
![Tablet view](screenshots/tablet.png)

### Mobile (390px)
![Mobile view](screenshots/mobile.png)

## Funcionalidades (todas as versões)

- Hero + estatísticas animadas (8 anos · 50 rolês · 30 irmãos)
- História do clube (fundado 07/09/2017, Village/Rio das Ostras)
- Valores: Respeito, Lealdade, Custom, Estrada
- Como fazer parte (3 passos)
- Galeria Instagram [@arcanjos_de_aco](https://www.instagram.com/arcanjos_de_aco/)
- Depoimentos, FAQ (incluindo homônimos RO/ES/MG)
- Formulário WhatsApp estruturado
- Responsivo, acessível (skip link, ARIA, reduced motion)
- HTML/CSS/JS puro — sem build step

## Desenvolvimento local

```bash
git clone https://github.com/tofariasti/landing-arcanjos-de-aco.git
cd landing-arcanjos-de-aco
npm install

# Atualizar fotos do Instagram
npm run sync:instagram

# Servidor local na porta 5500
npm run dev
```

URLs locais:

- Hub: `http://localhost:5500/`
- V1: `http://localhost:5500/v1-raca/`
- V2: `http://localhost:5500/v2-territorio/`
- V3: `http://localhost:5500/v3-aco-estrada/`

### Screenshots

```bash
npm run screenshots
```

Gera previews em `assets/img/previews/` (cards do hub) e screenshots responsivos em `screenshots/`.

## Estrutura

```
arcanjosdeaco/
├── index.html                 # Hub — seletor das 3 versões
├── assets/css/hub.css
├── assets/img/previews/       # Screenshots para cards do hub
├── shared/
│   ├── data/instagram.json    # Metadados das fotos IG
│   ├── img/                   # hero, about, profile-pic, gallery/
│   └── js/
│       ├── instagram.js       # Galeria compartilhada
│       └── whatsapp.js        # Formulário + número configurável
├── v1-raca/                   # Versão 1 — RAÇA
├── v2-territorio/             # Versão 2 — TERRITÓRIO
├── v3-aco-estrada/            # Versão 3 — AÇO ESTRADA
├── site/index.html            # Redirect → hub (compat. URL antiga)
├── screenshots/
├── scripts/
│   ├── sync-instagram.mjs
│   └── capture-screenshots.mjs
└── .github/workflows/deploy.yml
```

**Paths de imagens:** cada versão referencia `../shared/img/...` para compatibilidade com subpath do GitHub Pages.

## Personalização

1. **WhatsApp do clube:** altere `WHATSAPP_NUMBER` em `shared/js/whatsapp.js`
2. **Fotos do Instagram:** `npm run sync:instagram` atualiza `shared/data/instagram.json` e `shared/img/`
3. **Textos:** edite o `index.html` de cada versão

## Instagram

Todas as versões consomem o mesmo `shared/data/instagram.json`. O script `sync-instagram.mjs` baixa até 20 fotos de [@arcanjos_de_aco](https://www.instagram.com/arcanjos_de_aco/).

## Redes sociais do clube

URLs centralizadas em `shared/data/social.json`.

- Instagram: [@arcanjos_de_aco](https://www.instagram.com/arcanjos_de_aco/)
- Facebook: [Arcanjos de Aço MC](https://www.facebook.com/arcanjosdeacomc)

## Autor

**Tiago O. de Farias** — [Farias Digital](https://fariasdigital.com.br/)

- GitHub: [@tofariasti](https://github.com/tofariasti)
- WhatsApp: [(51) 99121-3724](https://wa.me/5551991213724)

---

<p align="center">
  <a href="https://tofariasti.github.io/landing-arcanjos-de-aco/">🌐 Hub Online</a> ·
  <a href="https://fariasdigital.com.br/">🏢 Site Comercial</a>
</p>
