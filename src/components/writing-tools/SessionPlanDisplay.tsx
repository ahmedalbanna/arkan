'use client';


import { GenerateSessionPlanOutput } from "@/ai/schemas";
import { MarkdownViewer } from "@/components/shared/MarkdownViewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Clock, FileSignature, FileText, HelpCircle, Lightbulb, List, MessageSquare, Package, Target, Users } from "lucide-react";

interface SessionPlanDisplayProps {
  data: GenerateSessionPlanOutput;
}

export const SessionPlanDisplay = ({ data }: SessionPlanDisplayProps) => {
  return (
    <AnimatedContainer animation="fade-in-up" delay={200}>
      <Card className="w-full shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardTitle className="text-2xl font-bold flex items-center font-headline">
            <BookOpen className="mr-3 h-7 w-7 text-primary" />
            {data.sessionTitle}
          </CardTitle>
          <CardDescription>A detailed, interactive session plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goals and Objectives */}
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedContainer animation="fade-in-up" delay={300}>
              <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                  <CardTitle className="text-lg flex items-center font-headline">
                    <Target className="mr-2 h-5 w-5" /> Session Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {data.sessionGoals.map((goal, index) => (
                      <li key={`goal-${index}`}>{goal}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedContainer>
            <AnimatedContainer animation="fade-in-up" delay={400}>
              <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                  <CardTitle className="text-lg flex items-center font-headline">
                    <CheckCircle className="mr-2 h-5 w-5" /> Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {data.learningObjectives.map((objective, index) => (
                      <li key={`objective-${index}`}>{objective}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Activities */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center font-headline">
              <List className="mr-2 h-6 w-6" /> Session Activities
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {data.activities.map((activity, index) => (
                <AnimatedContainer key={`activity-${index}`} animation="fade-in-up" delay={500 + index * 100}>
                  <AccordionItem value={`item-${index}`} className="shadow-soft hover:shadow-glow transition-all duration-200">
                    <AccordionTrigger className="text-lg font-medium hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10">
                      {index + 1}. {activity.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pl-2 border-l-2 ml-2 pl-4">
                      <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
                        <Badge variant="secondary" className="flex items-center gap-1.5 shadow-soft">
                          <Clock className="h-4 w-4" /> {activity.duration} mins
                        </Badge>
                        <Badge variant="outline" className="capitalize flex items-center gap-1.5 shadow-soft">
                          <Users className="h-4 w-4" /> {activity.type.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center font-headline"><HelpCircle className="mr-2 h-4 w-4" /> Objective</h4>
                        <p className="text-muted-foreground">{activity.objective}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center font-headline"><List className="mr-2 h-4 w-4" /> Instructions</h4>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownViewer content={activity.instructions} />
                        </div>
                      </div>
                      {activity.exampleLookFor && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center font-headline"><Lightbulb className="mr-2 h-4 w-4" /> Example of What to Look For</h4>
                          <p className="text-sm p-3 bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm rounded-md text-muted-foreground whitespace-pre-wrap shadow-soft">{activity.exampleLookFor}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center font-headline"><MessageSquare className="mr-2 h-4 w-4" /> Discussion Questions</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {activity.discussion.map((q, qIndex) => <li key={`q-${index}-${qIndex}`}>{q}</li>)}
                        </ul>
                      </div>
                      {activity.materials && activity.materials.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center font-headline">
                            <Package className="mr-2 h-4 w-4" /> Materials Needed:
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            {activity.materials.map((material, matIndex) => (
                              <li key={`material-${index}-${matIndex}`}>{material}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </AnimatedContainer>
              ))}
            </Accordion>
          </div>

          {/* Appendix */}
          {data.appendix && data.appendix.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center font-headline">
                <FileSignature className="mr-2 h-6 w-6" /> Appendix
              </h3>
              <div className="space-y-4">
                {data.appendix.map((handout, index) => (
                  <AnimatedContainer key={`handout-${index}`} animation="fade-in-up" delay={600 + index * 100}>
                    <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                        <CardTitle className="text-lg font-headline">{handout.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="prose prose-sm dark:prose-invert max-w-none"><MarkdownViewer content={handout.content} /></CardContent>
                    </Card>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          )}

          {/* Closing Summary */}
          <AnimatedContainer animation="fade-in-up" delay={700}>
            <Card className="bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                <CardTitle className="text-lg flex items-center font-headline">
                  <FileText className="mr-2 h-5 w-5" /> Closing Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{data.closingSummary}</p>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};
