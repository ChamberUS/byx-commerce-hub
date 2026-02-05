 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { ArrowLeft, Search, HelpCircle, Wallet, ShoppingBag, Store, Shield, Lock } from 'lucide-react';
 import { AppLayout } from '@/components/layout/AppLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from '@/components/ui/accordion';
 
 const faqData = {
   conta: {
     icon: HelpCircle,
     title: 'Conta',
     questions: [
       {
         q: 'Como criar minha conta no IAOS?',
         a: 'Para criar sua conta, basta informar seu email na tela de login. Você receberá um código de verificação para confirmar sua identidade. Não é necessário criar senha.'
       },
       {
         q: 'Posso usar a mesma conta como comprador e vendedor?',
         a: 'Sim! Você pode comprar produtos normalmente e também criar sua própria loja. Basta acessar "Minha Loja" no menu e criar seu perfil de vendedor.'
       },
       {
         q: 'Como editar meus dados pessoais?',
         a: 'Acesse "Minha Conta" no menu e clique em "Editar Perfil". Você pode alterar seu nome, foto e informações de contato.'
       },
       {
         q: 'Como excluir minha conta?',
         a: 'Por questões legais, dados de transações precisam ser mantidos. Entre em contato com nosso suporte para solicitar a desativação da conta.'
       }
     ]
   },
   carteira: {
     icon: Wallet,
     title: 'Carteira',
     questions: [
       {
         q: 'O que é a Carteira BYX?',
         a: 'A Carteira BYX é sua carteira digital non-custodial para guardar e usar tokens AIOS/BYX. Somente você tem acesso às suas chaves privadas.'
       },
       {
         q: 'O que é uma seed phrase?',
         a: 'A seed phrase são 12 ou 24 palavras que funcionam como backup da sua carteira. Guarde em local seguro e NUNCA compartilhe com ninguém. Com ela é possível recuperar sua carteira em qualquer dispositivo.'
       },
       {
         q: 'O que acontece se eu perder minha seed phrase?',
         a: 'Se você perder sua seed phrase e não tiver backup, não será possível recuperar sua carteira. Os fundos ficarão inacessíveis permanentemente. Por isso é essencial guardar a seed phrase em local seguro.'
       },
       {
         q: 'O que é o PIN da carteira?',
         a: 'O PIN é uma proteção adicional para acessar sua carteira no aplicativo. Mesmo que alguém tenha acesso ao seu dispositivo, precisará do PIN para fazer transações.'
       },
       {
         q: 'Posso usar minha carteira Keplr?',
         a: 'Sim! O IAOS suporta integração com a carteira Keplr. Você pode conectar sua carteira existente na tela de configuração.'
       }
     ]
   },
   compras: {
     icon: ShoppingBag,
     title: 'Compras',
     questions: [
       {
         q: 'Como funciona o pagamento com AIOS/BYX?',
         a: 'O pagamento é feito diretamente da sua carteira para um contrato inteligente de escrow. Isso garante que seu dinheiro só é liberado quando você confirmar o recebimento do produto.'
       },
       {
         q: 'O que é a proteção de compra (escrow)?',
         a: 'Quando você paga por um produto, o valor fica retido em um contrato de escrow. O vendedor só recebe após você confirmar o recebimento. Se houver problemas, você pode abrir uma disputa.'
       },
       {
         q: 'Como fazer uma oferta em um produto?',
         a: 'Se o produto aceita ofertas, você verá o botão "Fazer Oferta" na página do produto. Inicie uma conversa com o vendedor e envie sua proposta. O vendedor pode aceitar, recusar ou fazer uma contra-oferta.'
       },
       {
         q: 'Como confirmar o recebimento de um pedido?',
         a: 'Acesse "Meus Pedidos", encontre o pedido que recebeu e clique em "Confirmar Recebimento". Isso libera o pagamento para o vendedor.'
       },
       {
         q: 'Posso cancelar um pedido?',
         a: 'Antes do envio, você pode solicitar o cancelamento ao vendedor pelo chat. Após o envio, só é possível devolver após o recebimento.'
       }
     ]
   },
   vendas: {
     icon: Store,
     title: 'Vendas',
     questions: [
       {
         q: 'Como criar minha loja?',
         a: 'Acesse "Minha Loja" no menu e siga o processo de criação. Você precisará informar nome, descrição e fazer upload do logo da sua loja.'
       },
       {
         q: 'Como criar um anúncio?',
         a: 'Na sua loja, acesse "Anúncios" e clique em "Criar Anúncio". Preencha as informações do produto, adicione fotos e defina o preço. Você pode salvar como rascunho ou publicar imediatamente.'
       },
       {
         q: 'Quais tipos de anúncio posso criar?',
         a: 'Você pode criar anúncios de preço fixo, aceitar ofertas (negociação) ou leilão (em breve). Cada tipo tem suas vantagens dependendo do que você está vendendo.'
       },
       {
         q: 'Quando recebo o pagamento?',
         a: 'O pagamento é liberado automaticamente quando o comprador confirma o recebimento do produto. Se o comprador não confirmar em 7 dias após o envio, o pagamento é liberado automaticamente.'
       },
       {
         q: 'Como usar respostas rápidas no chat?',
         a: 'Acesse "Minha Loja" > "Respostas Rápidas" para criar atalhos de mensagens frequentes. No chat, clique no ícone de raio para inserir rapidamente.'
       }
     ]
   },
   seguranca: {
     icon: Shield,
     title: 'Segurança',
     questions: [
       {
         q: 'O IAOS é seguro?',
         a: 'Sim! Usamos criptografia de ponta a ponta, carteiras non-custodial (você controla suas chaves) e contratos inteligentes auditados para o escrow.'
       },
       {
         q: 'Como identificar golpes?',
         a: 'Desconfie de ofertas muito abaixo do mercado, vendedores que pedem pagamento fora da plataforma, ou links externos. Todo pagamento deve ser feito pela carteira IAOS.'
       },
       {
         q: 'O que fazer em caso de disputa?',
         a: 'Se houver problemas com um pedido, acesse os detalhes do pedido e clique em "Abrir Disputa". Nossa equipe analisará as evidências e tomará uma decisão justa.'
       },
       {
         q: 'Alguém pediu minha seed phrase. Devo compartilhar?',
         a: 'NUNCA compartilhe sua seed phrase! Nenhum funcionário do IAOS irá solicitar essa informação. Quem pedir está tentando roubar sua carteira.'
       }
     ]
   },
   privacidade: {
     icon: Lock,
     title: 'Privacidade',
     questions: [
       {
         q: 'Quais dados o IAOS coleta?',
         a: 'Coletamos apenas dados necessários para operar a plataforma: email, informações de perfil e histórico de transações. Nunca vendemos seus dados.'
       },
       {
         q: 'Minhas transações são públicas?',
         a: 'Transações em blockchain são públicas por natureza, mas seus dados pessoais não são vinculados ao endereço da carteira na blockchain.'
       },
       {
         q: 'Como exercer meus direitos LGPD?',
         a: 'Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento. Acesse "Conta" > "Privacidade" ou entre em contato com nosso suporte.'
       }
     ]
   }
 };
 
 export default function FAQ() {
   const [searchQuery, setSearchQuery] = useState('');
   const [activeTab, setActiveTab] = useState('conta');
 
   const filteredFaq = Object.entries(faqData).reduce((acc, [key, category]) => {
     if (!searchQuery) {
       acc[key] = category;
       return acc;
     }
     
     const query = searchQuery.toLowerCase();
     const filteredQuestions = category.questions.filter(
       item => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
     );
     
     if (filteredQuestions.length > 0) {
       acc[key] = { ...category, questions: filteredQuestions };
     }
     
     return acc;
   }, {} as typeof faqData);
 
   const totalResults = Object.values(filteredFaq).reduce(
     (sum, cat) => sum + cat.questions.length, 0
   );
 
   return (
     <AppLayout>
       {/* Header */}
       <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 border-b">
         <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
           <Button variant="ghost" size="icon" className="rounded-xl" asChild>
             <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
           </Button>
           <div>
             <h1 className="text-lg font-semibold">Central de Ajuda</h1>
             <p className="text-xs text-muted-foreground">Tire suas dúvidas sobre o IAOS</p>
           </div>
         </div>
       </header>
 
       <div className="max-w-4xl mx-auto px-4 py-6">
         {/* Search */}
         <div className="relative mb-6">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
           <Input
             placeholder="Buscar perguntas..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-12 h-12 rounded-xl text-base"
           />
         </div>
 
         {searchQuery && (
           <p className="text-sm text-muted-foreground mb-4">
             {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
           </p>
         )}
 
         {/* Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab}>
           <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 mb-6">
             {Object.entries(faqData).map(([key, category]) => {
               const Icon = category.icon;
               const hasResults = filteredFaq[key as keyof typeof faqData];
               if (searchQuery && !hasResults) return null;
               
               return (
                 <TabsTrigger
                   key={key}
                   value={key}
                   className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-4 py-2 border data-[state=inactive]:bg-card"
                 >
                   <Icon className="h-4 w-4 mr-2" />
                   {category.title}
                 </TabsTrigger>
               );
             })}
           </TabsList>
 
           {Object.entries(filteredFaq).map(([key, category]) => (
             <TabsContent key={key} value={key} className="mt-0">
               <div className="bg-card rounded-xl border p-4">
                 <Accordion type="single" collapsible className="w-full">
                   {category.questions.map((item, index) => (
                     <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                       <AccordionTrigger className="text-left hover:no-underline py-4">
                         <span className="font-medium pr-4">{item.q}</span>
                       </AccordionTrigger>
                       <AccordionContent className="text-muted-foreground pb-4">
                         {item.a}
                       </AccordionContent>
                     </AccordionItem>
                   ))}
                 </Accordion>
               </div>
             </TabsContent>
           ))}
         </Tabs>
 
         {/* Contact */}
         <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20 text-center">
           <HelpCircle className="h-10 w-10 mx-auto text-primary mb-3" />
           <h3 className="font-semibold mb-2">Não encontrou sua resposta?</h3>
           <p className="text-sm text-muted-foreground mb-4">
             Nossa equipe está pronta para ajudar você.
           </p>
           <Button className="rounded-xl">
             Falar com Suporte
           </Button>
         </div>
       </div>
     </AppLayout>
   );
 }