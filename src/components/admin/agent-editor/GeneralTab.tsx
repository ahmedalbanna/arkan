

'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { AgentEditorFormValues } from '@/lib/agent-editor-schema';
import { type AgentCategoryDetails as AgentCategory, type AgentPrompt } from '@/lib/types';
import { Bot, Cpu, Globe, MessageSquare, Plus, Sparkles, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

interface GeneralTabProps {
  isComplexPrompt: boolean;
  isPending: boolean;
  categories: AgentCategory[];
}

export default function GeneralTab({ isComplexPrompt, isPending, categories }: GeneralTabProps) {
  const { control, watch } = useFormContext<AgentEditorFormValues>();
  const { t } = useLocalization();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conversationStarters",
  });

  const promptValue = watch('prompt');
  const introductionValue = watch('introduction');
  const [promptLength, setPromptLength] = useState(0);
  const introLength = introductionValue?.length || 0;

  useEffect(() => {
    if (isComplexPrompt) {
      setPromptLength(((promptValue || { base: '' }) as AgentPrompt).base.length);
    } else {
      setPromptLength((promptValue as string)?.length || 0);
    }
  }, [promptValue, isComplexPrompt]);

  return (
    <div className='space-y-8'>
      <AnimatedContainer animation="fade-in-down" delay={200}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-glow">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-headline">{t('agentEditor.generalTitle')}</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1 mt-1">
              <Sparkles className="h-3 w-3" />
              AI Configuration
            </Badge>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={300}>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Bot className="h-4 w-4 text-primary" />
                {t('agentEditor.nameLabel')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  className="hover:shadow-soft transition-all duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={400}>
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('agentEditor.categoryLabel')}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value as string} disabled={isPending}>
                <FormControl>
                  <SelectTrigger className="hover:shadow-soft transition-all duration-200">
                    <SelectValue placeholder={t('agentManager.createDialog.selectCategoryPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={500}>
        {isComplexPrompt ? (
          <FormField
            control={control}
            name="prompt.base"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  {t('agentEditor.promptLabel')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={8}
                    className="font-mono text-sm hover:shadow-soft transition-all duration-200 resize-none"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  {t('agentEditor.promptLabel')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value as string}
                    rows={8}
                    className="font-mono text-sm hover:shadow-soft transition-all duration-200 resize-none"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={600}>
        <FormField
          control={control}
          name="introduction"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-center text-base font-medium">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {t('agentEditor.introduction')}
                </span>
                <Badge variant="outline" className="text-xs">{introLength}/500</Badge>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('agentEditor.introductionPlaceholder')}
                  rows={3}
                  className="hover:shadow-soft transition-all duration-200 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={700}>
        <FormField
          control={control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <MessageSquare className="h-4 w-4 text-primary" />
                {t('agentEditor.placeholder')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="hover:shadow-soft transition-all duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AnimatedContainer>

      <AnimatedContainer animation="fade-in-up" delay={800}>
        <FormItem>
          <FormLabel className="flex items-center gap-2 text-base font-medium mb-4">
            <MessageSquare className="h-4 w-4 text-primary" />
            {t('agentEditor.conversationStarters')}
          </FormLabel>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-background/50 to-primary/5 rounded-lg border border-border/50 hover:shadow-soft transition-all duration-200">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Input
                  {...control.register(`conversationStarters.${index}.value`)}
                  className="flex-grow hover:shadow-soft transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 hover:shadow-soft transition-all duration-200"
            onClick={() => append({ value: '' })}
          >
            <Plus className="me-2 h-4 w-4" />
            {t('agentEditor.addMessage')}
          </Button>
        </FormItem>
      </AnimatedContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedContainer animation="fade-in-up" delay={900}>
          <FormField
            control={control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  {t('agentEditor.tone')}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="hover:shadow-soft transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['Default', 'Professional', 'Creative', 'Inspiring', 'Casual', 'Confident', 'Authoritative', 'Formal', 'Informal'].map(tone =>
                      <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </AnimatedContainer>

        <AnimatedContainer animation="fade-in-up" delay={1000}>
          <FormField
            control={control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-medium">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('agentEditor.language')}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="hover:shadow-soft transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['English (US)', 'English (UK)', 'Русский', 'Deutsch', 'Español', 'Français', 'Italiano', '日本語', '한국어', 'Nederlands', 'Polski', 'Português', 'Svenska', 'Türk', 'Tiếng Việt', '中文 (简体)', '中文 (繁體)', 'اَلْعَرَبِيَّة', 'Suomi', 'עברית', 'Norsk', 'فارسی', 'Românește', 'தமிழ்', 'ภาษาไทย', 'українська мова', 'Bahasa Indonesia', 'Czech', 'Slovak', 'Hungarian', 'Danish'].map(lang =>
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </AnimatedContainer>
      </div>

      <AnimatedContainer animation="fade-in-up" delay={1100}>
        <FormField
          control={control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Cpu className="h-4 w-4 text-primary" />
                {t('agentEditor.aiModel')}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="hover:shadow-soft transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="googleai/gemini-2.0-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="googleai/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </AnimatedContainer>

    </div>
  );
}
