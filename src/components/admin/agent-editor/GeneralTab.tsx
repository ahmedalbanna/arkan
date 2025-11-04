
'use client';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { type AgentCategoryDetails as AgentCategory, type AgentPrompt } from '@/lib/types';
import { MessageSquare, Plus, X, Pencil, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useToast } from '@/hooks/util/use-toast';
import { useDebounce } from '@/hooks/util/use-debounce';
import { AgentEditorFormValues } from '@/hooks';

interface GeneralTabProps {
  agentId: string;
  isComplexPrompt: boolean;
  isPending: boolean;
  categories: AgentCategory[];
}

// New DebouncedTextarea component
function DebouncedTextarea({ value, onChange, ...props }: React.ComponentProps<typeof Textarea> & { value: string; onChange: (value: string) => void }) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    // Update local state if the parent value changes from an external source (like a reset)
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <Textarea
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      {...props}
    />
  );
}


export default function GeneralTab({ agentId, isComplexPrompt, isPending, categories }: GeneralTabProps) {
  const { control, watch, getValues, setValue } = useFormContext<AgentEditorFormValues>();
  const { t } = useLocalization();
  const [isCopied, setIsCopied] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conversationStarters",
  });

  const promptValue = watch('prompt');
  const introductionValue = watch('introduction');
  const introLength = introductionValue?.length || 0;

  const { toast } = useToast();

  const handleCopyId = () => {
    navigator.clipboard.writeText(agentId);
    setIsCopied(true);
    toast({ title: "Agent ID Copied!" });
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className='space-y-6'>
      <CardTitle>{t('agentEditor.generalTitle')}</CardTitle>

      <div className="space-y-2">
        <Label htmlFor="agent-id">{t('agentEditor.idLabel')}</Label>
        <div className="flex items-center gap-2">
          <Input id="agent-id" value={agentId} readOnly disabled className="font-mono" />
          <Button type="button" variant="ghost" size="icon" onClick={handleCopyId}>
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('agentEditor.nameLabel')}</FormLabel>
            <FormControl><Input {...field} disabled={isPending} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('agentEditor.categoryLabel')}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value as string} disabled={isPending}>
              <FormControl><SelectTrigger><SelectValue placeholder={t('agentManager.createDialog.selectCategoryPlaceholder')} /></SelectTrigger></FormControl>
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

      {isComplexPrompt ? (
        <FormField
          control={control}
          name="prompt.base"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('agentEditor.promptLabel')}</FormLabel>
              <FormControl>
                <DebouncedTextarea
                  {...field}
                  rows={8}
                  className="font-mono text-sm"
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
              <FormLabel>{t('agentEditor.promptLabel')}</FormLabel>
              <FormControl>
                <DebouncedTextarea
                  {...field}
                  value={field.value as string}
                  onChange={(val) => setValue('prompt', val)}
                  rows={8}
                  className="font-mono text-sm"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="introduction"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex justify-between items-center">
              <span>{t('agentEditor.introduction')}</span>
              <span className="text-xs text-muted-foreground">{introLength}/500</span>
            </FormLabel>
            <FormControl><Textarea {...field} placeholder={t('agentEditor.introductionPlaceholder')} rows={3} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('agentEditor.placeholder')}</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>{t('agentEditor.conversationStarters')}</FormLabel>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <Input {...control.register(`conversationStarters.${index}.value`)} className="flex-grow" />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}><Plus className="me-2 h-4 w-4" />{t('agentEditor.addMessage')}</Button>
      </FormItem>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('agentEditor.tone')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Default', 'Professional', 'Creative', 'Inspiring', 'Casual', 'Confident', 'Authoritative', 'Formal', 'Informal'].map(tone => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('agentEditor.language')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['English (US)', 'English (UK)', 'Русский', 'Deutsch', 'Español', 'Français', 'Italiano', '日本語', '한국어', 'Nederlands', 'Polski', 'Português', 'Svenska', 'Türk', 'Tiếng Việt', '中文 (简体)', '中文 (繁體)', 'اَلْعَرَبِيَّة', 'Suomi', 'עברית', 'Norsk', 'فارسی', 'Românește', 'தமிழ்', 'ภาษาไทย', 'українська мова', 'Bahasa Indonesia', 'Czech', 'Slovak', 'Hungarian', 'Danish'].map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('agentEditor.aiModel')}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="googleai/gemini-2.0-flash">Gemini 1.5 Flash</SelectItem>
                <SelectItem value="googleai/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
}
