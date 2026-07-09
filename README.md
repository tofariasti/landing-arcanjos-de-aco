# Arcanjos de Aço MC — Motoclube

Landing page de alta conversão para o motoclube Arcanjos de Aço MC de Rio das Ostras, RJ, desenvolvida com foco em responsividade, acessibilidade e integração WhatsApp.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://tofariasti.github.io/landing-arcanjos-de-aco/)

## Demo

**Moldura (preview):** [https://tofariasti.github.io/landing-arcanjos-de-aco/](https://tofariasti.github.io/landing-arcanjos-de-aco/)

**Tela cheia:** [https://tofariasti.github.io/landing-arcanjos-de-aco/site/](https://tofariasti.github.io/landing-arcanjos-de-aco/site/)

## Screenshots

### Desktop (1280px)
![Desktop view](screenshots/desktop.png)

### Tablet (768px)
![Tablet view](screenshots/tablet.png)

### Mobile (390px)
![Mobile view](screenshots/mobile.png)

## Funcionalidades

- Layout exclusivo **"Asfalto Infinito"** — navegação lateral numerada, hero cinematográfico, galeria filmstrip horizontal, bento assimétrico e formulário estilo ingresso
- Design responsivo (mobile-first) com identidade visual de motoclube custom (preto asfalto, laranja chama, cromado, couro e latão)
- Integração WhatsApp com formulário estruturado para interesse em fazer parte do clube
- Animações ao scroll (AOS) + partículas, contadores, preloader e hover effects
- Acessibilidade WCAG 2.1 AA (skip link, ARIA, foco visível, reduced motion)
- SEO básico (meta description, HTML semântico)
- Botão flutuante WhatsApp com pulse
- FAQ accordion interativo
- Galeria com lazy loading e crédito ao Instagram
- Moldura iframe com preview desktop/tablet/mobile

## Seções

1. **Hero** — Headline, CTAs, estatísticas animadas e imagem impactante
2. **Sobre o clube** — História, valores e sede em Rio das Ostras
3. **Como fazer parte** — 3 passos: contato → encontro → integração
4. **Eventos & rolês** — Rolês, churrascões, ações sociais e eventos MC
5. **Galeria** — 8 fotos com crédito ao [@arcanjos_de_aco](https://www.instagram.com/arcanjos_de_aco/)
6. **Depoimentos** — 3 avaliações de irmãos
7. **CTA** — Seção de conversão intermediária
8. **FAQ** — Requisitos, sede, eventos e homônimos
9. **Contato** — Formulário WhatsApp para fazer parte do clube
10. **Footer** — Instagram, endereço e créditos

## Tecnologias

- HTML5 semântico
- CSS3 (Flexbox/Grid, custom properties)
- JavaScript vanilla (ES6+)
- AOS (Animate On Scroll) v2.3.4
- Font Awesome 6.4
- Google Fonts (Staatliches + Barlow Condensed)

## Testes de Responsividade

| Dispositivo | Resolução | Status |
|-------------|-----------|--------|
| iPhone SE | 375×667 | ✅ |
| iPhone 12 Pro | 390×844 | ✅ |
| iPhone 14 Pro Max | 428×926 | ✅ |
| iPad | 768×1024 | ✅ |
| Desktop HD | 1280×720 | ✅ |
| Desktop FHD | 1920×1080 | ✅ |

## Acessibilidade

- Semântica HTML5 adequada (`header`, `nav`, `main`, `section`, `footer`)
- Atributos ARIA quando necessário (`aria-expanded`, `aria-label`)
- Contraste WCAG AA (texto claro sobre fundo escuro)
- Navegação por teclado (Escape fecha menu)
- Focus states visíveis em todos os interativos
- Alt text em imagens
- Labels associados a inputs
- Font-size mínimo 16px no mobile
- Skip link para conteúdo principal
- Respeita `prefers-reduced-motion`

## Como usar

```bash
git clone https://github.com/tofariasti/landing-arcanjos-de-aco.git
cd landing-arcanjos-de-aco
# Abrir index.html no navegador (preview com moldura iframe)
# Ou abrir site/index.html para tela cheia
python3 -m http.server 8080
```

## Personalização

1. **WhatsApp:** altere `WHATSAPP_NUMBER` em `site/assets/js/main.js`
2. **Cores:** edite as variáveis CSS em `:root` no `site/assets/css/style.css`
3. **Textos e eventos:** edite `site/index.html`
4. **Fotos:** substitua arquivos em `site/assets/img/gallery/` por fotos oficiais do clube

## Estrutura

```
arcanjosdeaco/
├── index.html              # Preview shell (moldura iframe)
├── assets/css/preview.css
├── assets/js/preview.js
├── site/
│   ├── index.html          # Landing page
│   └── assets/
│       ├── css/style.css
│       ├── js/main.js
│       └── img/
├── screenshots/
├── scripts/
│   ├── capture-screenshots.mjs
│   └── test-responsive.mjs
├── .github/workflows/deploy.yml
└── README.md
```

## Redes sociais do clube

- Instagram: [@arcanjos_de_aco](https://www.instagram.com/arcanjos_de_aco/)

## Autor

**Tiago O. de Farias** — [Farias Digital](https://fariasdigital.com.br/)

- GitHub: [@tofariasti](https://github.com/tofariasti)
- WhatsApp: [(51) 99121-3724](https://wa.me/5551991213724)

---

<p align="center">
  <a href="https://tofariasti.github.io/landing-arcanjos-de-aco/">🌐 Demo Online</a> ·
  <a href="https://fariasdigital.com.br/">🏢 Site Comercial</a>
</p>
