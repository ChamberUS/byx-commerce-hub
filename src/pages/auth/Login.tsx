 import { useState } from 'react';
 import { useNavigate, Link } from 'react-router-dom';
 import { Loader2, Mail, Shield, Wallet, Store, ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 import { z } from 'zod';
 
 const emailSchema = z.string().email('Digite um email válido');
 
 export default function Login() {
   const navigate = useNavigate();
   const { signInWithOtp } = useAuth();
   const { toast } = useToast();
 
   const [email, setEmail] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
 
     const result = emailSchema.safeParse(email.trim());
     if (!result.success) {
       setError(result.error.errors[0].message);
       return;
     }
 
     setLoading(true);
 
     try {
       const { error: signInError } = await signInWithOtp(email.trim());
 
       if (signInError) {
         throw signInError;
       }
 
       sessionStorage.setItem('byx_auth_email', email.trim());
       navigate('/auth/verify');
     } catch (err: any) {
       toast({
         variant: 'destructive',
         title: 'Erro ao enviar código',
         description: err.message || 'Tente novamente mais tarde.',
       });
     } finally {
       setLoading(false);
     }
   };
 
   const features = [
     { icon: Shield, text: 'Compra protegida com escrow' },
     { icon: Wallet, text: 'Carteira non-custodial segura' },
     { icon: Store, text: 'Marketplace descentralizado' },
   ];
 
   return (
     <div className="min-h-screen flex">
       {/* Left Panel - Branding (Desktop) */}
       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/80 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
         <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
           <div className="mb-12">
             <h1 className="text-5xl xl:text-6xl font-bold text-white mb-4">
               IAOS
             </h1>
             <p className="text-xl text-white/90 font-light">
               A moeda do novo comércio
             </p>
           </div>
           
           <div className="space-y-6">
             {features.map((feature, index) => (
               <div key={index} className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                   <feature.icon className="h-6 w-6 text-white" />
                 </div>
                 <span className="text-lg text-white/90">{feature.text}</span>
               </div>
             ))}
           </div>
 
           <div className="mt-16 pt-8 border-t border-white/20">
             <p className="text-white/60 text-sm">
               Milhares de usuários já confiam no IAOS para comprar e vender com segurança.
             </p>
           </div>
         </div>
 
         {/* Decorative Elements */}
         <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
         <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
       </div>
 
       {/* Right Panel - Form */}
       <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16">
         <div className="w-full max-w-md mx-auto">
           {/* Mobile Logo */}
           <div className="lg:hidden text-center mb-8">
             <h1 className="text-3xl font-bold text-primary mb-2">IAOS</h1>
             <p className="text-muted-foreground">A moeda do novo comércio</p>
           </div>
 
           <div className="mb-8">
             <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
               Bem-vindo de volta
             </h2>
             <p className="text-muted-foreground mt-2">
               Entre com seu email para continuar
             </p>
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
               <Label htmlFor="email" className="text-sm font-medium">
                 Endereço de email
               </Label>
               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input
                   id="email"
                   type="email"
                   placeholder="seu@email.com"
                   value={email}
                   onChange={(e) => {
                     setEmail(e.target.value);
                     setError('');
                   }}
                   className={`pl-12 h-12 rounded-xl text-base ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                   autoComplete="email"
                   autoFocus
                 />
               </div>
               {error && <p className="text-sm text-destructive">{error}</p>}
             </div>
 
             <Button
               type="submit"
               disabled={loading || !email.trim()}
               className="w-full h-12 rounded-xl text-base font-medium"
               size="lg"
             >
               {loading ? (
                 <>
                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                   Enviando código...
                 </>
               ) : (
                 <>
                   Continuar
                   <ArrowRight className="ml-2 h-5 w-5" />
                 </>
               )}
             </Button>
           </form>
 
           <div className="mt-8 pt-6 border-t">
             <p className="text-sm text-muted-foreground text-center">
               Ao continuar, você concorda com nossos{' '}
               <Link to="/legal/terms" className="text-primary hover:underline font-medium">
                 Termos de Uso
               </Link>{' '}
               e{' '}
               <Link to="/legal/privacy" className="text-primary hover:underline font-medium">
                 Política de Privacidade
               </Link>
               .
             </p>
           </div>
 
           {/* Mobile Features */}
           <div className="lg:hidden mt-12 pt-8 border-t">
             <div className="grid grid-cols-3 gap-4 text-center">
               {features.map((feature, index) => (
                 <div key={index} className="space-y-2">
                   <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                     <feature.icon className="h-5 w-5 text-primary" />
                   </div>
                   <p className="text-xs text-muted-foreground">{feature.text}</p>
                 </div>
               ))}
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }