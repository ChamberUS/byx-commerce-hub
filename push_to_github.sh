#!/bin/bash
# Script de push automático - BYX Mobile Responsive (Fase 1 + 2)

set -e

echo "🚀 BYX Mobile Responsive - Push para GitHub"
echo "============================================"
echo

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto byx-commerce-hub"
    exit 1
fi

# Backup da branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"
echo

# Atualizar main
echo "📥 1. Atualizando branch main..."
git checkout main
git pull origin main
echo "✅ Main atualizada"
echo

# Criar nova branch
BRANCH_NAME="feature/mobile-responsive-phase1-2"
echo "🌿 2. Criando branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME 2>/dev/null || git checkout $BRANCH_NAME
echo "✅ Branch criada/selecionada"
echo

# Adicionar arquivos novos
echo "📦 3. Adicionando arquivos novos..."
git add frontend/src/lib/responsive-constants.ts
git add frontend/src/components/common/PageContainer.tsx
git add frontend/src/components/common/MobileHelpers.tsx
git add frontend/src/components/marketplace/CarouselSection.tsx
echo "✅ Componentes novos adicionados"
echo

# Adicionar modificações
echo "⚡ 4. Adicionando modificações..."
git add frontend/src/pages/app/Home.tsx
git add frontend/src/components/marketplace/CryptoUSPBanner.tsx
git add frontend/src/components/marketplace/ProductCard.tsx
git add frontend/src/components/marketplace/SectorGrid.tsx
git add frontend/src/index.css
git add frontend/src/pages/app/Checkout.tsx
echo "✅ Modificações adicionadas"
echo

# Adicionar documentação
echo "📚 5. Adicionando documentação..."
git add RELATORIO_RESPONSIVIDADE.md
git add SUMARIO_EXECUTIVO.md
git add CHECKLIST_TESTES_MOBILE.md
git add FASE2_RELATORIO.md
echo "✅ Documentação adicionada"
echo

# Status
echo "📊 6. Status dos arquivos:"
git status --short
echo

# Commit
echo "💾 7. Criando commit..."
git commit -m "feat: Mobile-first responsive design system (Phase 1 + 2)

✨ New Features:
- Sistema de design responsivo unificado (responsive-constants.ts)
- Home reformulada com carrosséis estilo eBay (3 seções)
- Banner AIOS com glassmorphism + motion-safe
- Componentes utilitários (PageContainer, MobileHelpers)

🎨 Improvements:
- ProductCard touch-friendly (44px targets)
- Categorias em grid 2/4/7 colunas
- Cards carrossel 220-240px mobile
- Animações respeitando prefers-reduced-motion

📱 Mobile-First:
- Touch targets ≥ 44px (WCAG AAA)
- Typography responsiva (12/14/16px)
- Grids adaptativos (2/3/4 colunas)
- BottomNav offset automático (pb-20 md:pb-6)

📚 Documentation:
- RELATORIO_RESPONSIVIDADE.md (Fase 1 completa)
- FASE2_RELATORIO.md (Fase 2 fundação)
- SUMARIO_EXECUTIVO.md (overview)
- CHECKLIST_TESTES_MOBILE.md (testes por página)

🔧 Components Created:
- PageContainer: Padding consistente + BottomNav offset
- MobileCard: Cards touch-friendly
- ResponsiveInput: Inputs 44px com label
- StepIndicator: Steps mobile-friendly
- StickyBottomBar: CTA fixo acima BottomNav
- CarouselSection: Carrosséis horizontais swipe

⚡ Performance:
- Lazy loading de imagens
- Motion-safe animations
- Scrollbar-hide utility
- Touch feedback (active:scale)

Tested on 390x844 (iPhone 12/13)"

echo "✅ Commit criado"
echo

# Push
echo "🚀 8. Fazendo push para origin..."
git push -u origin $BRANCH_NAME

echo
echo "✅ SUCESSO! Push completo"
echo
echo "📝 Próximos passos:"
echo "   1. Acesse: https://github.com/ChamberUS/byx-commerce-hub/pulls"
echo "   2. Crie um Pull Request de '$BRANCH_NAME' para 'main'"
echo "   3. Adicione reviewers e labels"
echo "   4. Use a descrição do arquivo PUSH_MANUAL_INSTRUCTIONS.md"
echo
echo "🎉 Pronto!"
