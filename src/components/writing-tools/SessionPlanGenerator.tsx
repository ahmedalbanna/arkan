
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { SessionPlanDisplay } from '@/components/writing-tools/SessionPlanDisplay';
import { useSessionPlanGeneratorLogic } from '@/hooks/use-session-plan-generator-logic';
import { Loader2 } from 'lucide-react';

export const SessionPlanGenerator = () => {
  const { form, mutation, generatedContent, onSubmit } = useSessionPlanGeneratorLogic();

  return (
    <div className="space-y-8">
      <AnimatedContainer animation="fade-in-up" delay={200}>
        <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardTitle className="font-headline">Session Plan Generator</CardTitle>
            <CardDescription>
              Craft a practical, interactive session plan from your chapter content. Focus on dynamic engagement and hands-on activities.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                  <FormField
                    control={form.control}
                    name="chapterContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline">Chapter Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the content of your lecture or chapter here..."
                            className="min-h-[200px] resize-y hover:shadow-soft transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AnimatedContainer>
                <div className="grid md:grid-cols-2 gap-6">
                  <AnimatedContainer animation="fade-in-up" delay={400}>
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-headline">Target Audience (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Beginner developers, Senior managers" {...field} className="hover:shadow-soft transition-all duration-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AnimatedContainer>
                  <AnimatedContainer animation="fade-in-up" delay={500}>
                    <FormField
                      control={form.control}
                      name="sessionDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-headline">Total Session Duration: {field.value} minutes</FormLabel>
                          <FormControl>
                            <Slider
                              min={10}
                              max={240}
                              step={5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="hover:shadow-soft transition-all duration-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AnimatedContainer>
                </div>
                <AnimatedContainer animation="fade-in-up" delay={600}>
                  <FormField
                    control={form.control}
                    name="numActivities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline">Number of Activities: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="hover:shadow-soft transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AnimatedContainer>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={mutation.isPending} className="hover:shadow-glow transition-all duration-200" variant="gradient">
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Session Plan (1 Credit)
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </AnimatedContainer>

      {mutation.isPending && (
        <AnimatedContainer animation="fade-in-up" delay={700}>
          <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">The AI is designing your session plan... this may take a moment.</p>
            </CardContent>
          </Card>
        </AnimatedContainer>
      )}

      {generatedContent && <SessionPlanDisplay data={generatedContent} />}
    </div>
  );
};
