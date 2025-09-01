

'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { AgentEditorFormValues } from '@/lib/agent-editor-schema';
import { CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Plus, X } from 'lucide-react';
import { type AgentPrompt, type AgentCategory } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { useLocalization } from '@/context/LocalizationContext';

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
        setPromptLength(((promptValue || { base: ''}) as AgentPrompt).base.length);
      } else {
        setPromptLength((promptValue as string)?.length || 0);
      }
    }, [promptValue, isComplexPrompt]);

    return (
        <div className='space-y-6'>
            <CardTitle>{t('agentEditor.generalTitle')}</CardTitle>

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
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {categories?.map(cat => (
                                <SelectItem key={cat as string} value={cat as string}>{cat as string}</SelectItem>

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
                      <Textarea {...field} rows={8} className="font-mono text-sm" disabled={isPending} />
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
                    <FormControl><Textarea {...field} value={field.value as string} rows={8} className="font-mono text-sm" disabled={isPending} /></FormControl>
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
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}><Plus className="me-2 h-4 w-4"/>{t('agentEditor.addMessage')}</Button>
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
                              <SelectItem value="googleai/gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
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
