import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Download, User, Building, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  empresa: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
});

type FormData = z.infer<typeof formSchema>;

interface LeadCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData & { leadId: string }) => void;
  answers: Record<string, string>;
  scores: Record<string, number>;
}

export function LeadCaptureForm({ isOpen, onClose, onSubmit, answers, scores }: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      empresa: "",
      cargo: "",
      telefone: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Primeiro, salvar o lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert([{
          nome: data.nome,
          email: data.email,
          empresa: data.empresa,
          cargo: data.cargo,
          telefone: data.telefone
        }])
        .select()
        .single();

      if (leadError) {
        toast.error("Erro ao salvar dados. Tente novamente.");
        return;
      }

      // Preparar respostas para salvar
      const responses = Object.entries(answers).map(([questionId, answerValue]) => ({
        lead_id: leadData.id,
        question_id: questionId,
        question_text: "", // Será preenchido se necessário
        answer_value: answerValue,
        category: "" // Será preenchido se necessário
      }));

      // Salvar respostas
      const { error: responsesError } = await supabase
        .from('questionario_responses')
        .insert(responses);

      if (responsesError) {
        console.error("Erro ao salvar respostas:", responsesError);
      }

      // Calcular nível de maturidade
      const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
      const maturityLevel = Math.round(overallScore);

      // Salvar resultado final
      const { error: resultError } = await supabase
        .from('maturity_results')
        .insert([{
          lead_id: leadData.id,
          overall_score: overallScore,
          maturity_level: maturityLevel,
          category_scores: scores
        }]);

      if (resultError) {
        console.error("Erro ao salvar resultado:", resultError);
      }

      toast.success("Dados salvos com sucesso!");
      await onSubmit({ ...data, leadId: leadData.id });
      onClose();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-primary flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Receba seu Relatório Completo
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Preencha seus dados abaixo para receber o diagnóstico completo de maturidade em vendas B2B
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Empresa
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da sua empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu cargo na empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : "Baixar Relatório"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Seus dados estão seguros e serão utilizados apenas para envio do relatório e contato da Mastervendas
        </div>
      </DialogContent>
    </Dialog>
  );
}