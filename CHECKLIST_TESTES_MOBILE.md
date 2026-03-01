# 📱 Checklist de Testes Mobile - BYX/IAOS

**Device de Teste**: iPhone 12/13 (390x844px)  
**Navegadores**: Safari Mobile, Chrome Mobile

---

## ✅ HOME (Início)

### Header Mobile
- [ ] Logo "B" visível e bem posicionado
- [ ] Nome do usuário legível
- [ ] WalletMiniWidget (compact) funcional
- [ ] Botão de notificações com badge visível
- [ ] Avatar clicável e bem posicionado
- [ ] Header sticky ao scrollar

### Banner Bem-vindo
- [ ] Título "Olá, {nome}! 👋" legível
- [ ] Descrição não quebrada
- [ ] Botão "Explorar Produtos" touch-friendly (min 44px)
- [ ] Botão "Meus Pedidos" touch-friendly
- [ ] Layout vertical no mobile, sem estouro

### Banner AIOS
- [ ] Glassmorphism visível e bonito
- [ ] Ícone Coins animado ao tocar
- [ ] Texto legível (não muito pequeno)
- [ ] Clicável (leva para /app/wallet)
- [ ] Animação shimmer ao tocar (subtle)
- [ ] Não quebra em telas pequenas

### Carrosséis (3x)
- [ ] **Patrocínios do mês**: swipe horizontal funciona
- [ ] **Ofertas do dia**: cards visíveis e navegáveis
- [ ] **Melhores anúncios**: scroll suave
- [ ] Cards com 260px de largura (confortável)
- [ ] Imagens carregam (lazy loading)
- [ ] Badges legíveis ("Novo", "Aceita oferta")
- [ ] Preço destacado e legível
- [ ] Link "Ver todos" clicável

### Categorias
- [ ] Grid 2 colunas no mobile
- [ ] Ícones circulares 64px (touch-friendly)
- [ ] Labels legíveis (12px)
- [ ] Todas as categorias visíveis de uma vez
- [ ] Touch feedback (scale ao tocar)
- [ ] Navegação funciona

### Seção "Novidades"
- [ ] Grid 2 colunas no mobile
- [ ] 4 produtos visíveis (+ "Ver todos")
- [ ] ProductCard com aspect ratio correto
- [ ] Títulos com line-clamp (não estouram)
- [ ] Preços legíveis (16px)
- [ ] Botão favorito 36px (fácil de tocar)
- [ ] Badges não sobrepõem imagem

### Lojas Verificadas
- [ ] Cards navegáveis horizontalmente
- [ ] Informações legíveis
- [ ] Badges "Verificado" visíveis

### Trust Signals
- [ ] Ícones e textos legíveis
- [ ] Layout vertical confortável

### CTA Lojista
- [ ] Título legível
- [ ] Botão 44px de altura
- [ ] Clicável e responsivo

### Footer
- [ ] Grid 2 colunas no mobile
- [ ] Links clicáveis (min 44px hit-area)
- [ ] Textos legíveis
- [ ] Copyright visível

### BottomNav
- [ ] Fixo na base da tela
- [ ] 5 itens visíveis
- [ ] Ícones 20px (confortáveis)
- [ ] Labels legíveis (10px)
- [ ] Estado ativo destacado
- [ ] Não sobrepõe conteúdo
- [ ] Safe area (iOS) respeitada

---

## ✅ SEARCH

### Header
- [ ] Search bar confortável (44px)
- [ ] Botão "Buscar" touch-friendly
- [ ] Botão "Filtros" visível com badge

### Filtros (Bottom Sheet)
- [ ] Abre de baixo para cima
- [ ] Altura 80vh (confortável)
- [ ] Scroll interno funciona
- [ ] Checkboxes touch-friendly
- [ ] Sliders funcionam no touch
- [ ] Botões "Limpar" e "Aplicar" 44px

### Resultados
- [ ] Grid 2 colunas
- [ ] ProductCard otimizado
- [ ] Lazy loading funciona
- [ ] "Ver mais" ou paginação

---

## ✅ PRODUCT DETAIL

### Header
- [ ] Botão voltar visível
- [ ] Botões share e favorito 44px
- [ ] Sticky ao scrollar

### Galeria
- [ ] Imagem full-width
- [ ] Swipe entre imagens funciona
- [ ] Thumbnails scrolláveis
- [ ] Botões prev/next visíveis

### Info
- [ ] Título legível
- [ ] Preço destacado
- [ ] Badges visíveis
- [ ] Descrição com espaçamento adequado
- [ ] Botões CTA 44px ("Comprar", "Contatar")

### Loja
- [ ] Info da loja legível
- [ ] Avatar e nome visíveis
- [ ] Link clicável

---

## ✅ CHECKOUT (PENDENTE)

### Formulário
- [ ] Inputs 44px
- [ ] Labels legíveis
- [ ] Validação visível
- [ ] Teclado não quebra layout

### Resumo
- [ ] Produto visível
- [ ] Preço destacado
- [ ] Total claro

### Pagamento
- [ ] Opções clicáveis
- [ ] Botão "Finalizar" 44px

---

## ✅ ORDERS (PENDENTE)

### Lista
- [ ] Cards com info completa
- [ ] Status badges legíveis
- [ ] Clicáveis (ver detalhes)

### Filtros
- [ ] Tabs ou dropdown funcionais

---

## ✅ CHAT (PENDENTE)

### Lista
- [ ] Conversas legíveis
- [ ] Avatar + nome + última msg
- [ ] Badge não lidas visível
- [ ] Scroll suave

### Room
- [ ] Mensagens legíveis
- [ ] Input 44px
- [ ] Botão enviar touch-friendly
- [ ] Scroll automático

---

## ✅ WALLET (PENDENTE)

### Saldo
- [ ] Card destacado
- [ ] Valor legível (grande)
- [ ] Botões "Depositar"/"Sacar" 44px

### Histórico
- [ ] Transações legíveis
- [ ] Filtros funcionais
- [ ] Scroll infinito ou paginação

---

## ✅ SELLER HUB (PENDENTE)

### Dashboard
- [ ] Gráficos responsivos (Recharts)
- [ ] Cards de métricas legíveis
- [ ] Navegação funcional

### Produtos
- [ ] Tabela ou cards no mobile
- [ ] Ações (editar, deletar) touch-friendly

### Wizard Anúncio
- [ ] Steps visíveis
- [ ] Formulários 44px
- [ ] Upload de imagens funcional
- [ ] Preview mobile-friendly

---

## ✅ ACCOUNT (PENDENTE)

### Profile
- [ ] Avatar grande e clicável
- [ ] Inputs 44px
- [ ] Toggles touch-friendly
- [ ] Botão salvar 44px

### Settings
- [ ] Lista de opções legível
- [ ] Switches funcionais
- [ ] Navegação clara

---

## 🎯 CRITÉRIOS DE ACEITE GERAL

### Layout
- [ ] Nenhum conteúdo cortado ou fora da tela
- [ ] Nenhum scroll horizontal não intencional
- [ ] Padding/margin consistentes (16px padrão)
- [ ] BottomNav não cobre conteúdo

### Touch
- [ ] Todos os botões min 44x44px
- [ ] Hit-areas adequadas (não muito pequenas)
- [ ] Feedback visual ao tocar (scale, ripple)
- [ ] Swipe gestures funcionam onde aplicável

### Typography
- [ ] Nenhum texto < 12px
- [ ] Títulos legíveis e hierarquia clara
- [ ] Line-height adequado (1.5+)
- [ ] Contraste suficiente (4.5:1+)

### Performance
- [ ] Lazy loading funciona
- [ ] Skeletons aparecem antes do conteúdo
- [ ] Animações suaves (60fps)
- [ ] Nenhum layout shift (CLS < 0.1)

### iOS Específico
- [ ] Safe areas respeitadas (notch)
- [ ] Teclado não quebra layout
- [ ] Scroll bounce natural
- [ ] Back swipe não conflita com carrosséis

---

## 🐛 BUGS CONHECIDOS

*Nenhum no momento*

---

## 📝 NOTAS

- Testar em modo light E dark
- Testar com/sem conteúdo
- Testar com nomes/títulos longos
- Testar com imagens quebradas
- Testar com internet lenta (throttling)

---

**Última atualização**: 01/03/2026  
**Status**: Fase 1 completa, Fase 2 pendente
