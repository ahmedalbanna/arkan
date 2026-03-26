
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { SessionPlanDisplay } from '@/modules/ai/adapters/components/writing-tools/SessionPlanDisplay';
import { useSessionPlanGeneratorLogic } from '@/modules/ai/adapters/hooks/writing-tools/use-session-plan-generator-logic';
import { Loader2 } from 'lucide-react';

export const SessionPlanGenerator = () => {
  const { form, mutation, result, onSubmit } = useSessionPlanGeneratorLogic();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Session Plan Generator</CardTitle>
          <CardDescription>
            Craft a practical, interactive session plan from your chapter content. Focus on dynamic engagement and hands-on activities.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="chapterContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the content of your lecture or chapter here..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Beginner developers, Senior managers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Session Duration: {field.value} minutes</FormLabel>
                      <FormControl>
                        <Slider
                          min={10}
                          max={240}
                          step={5}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="numActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Activities: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Session Plan (1 Credit)
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {mutation.isPending && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">The AI is designing your session plan... this may take a moment.</p>
          </CardContent>
        </Card>
      )}

      {result && <SessionPlanDisplay data={result} />}
    </div>
  );
};
