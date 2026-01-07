
'use client';


import { GenerateSessionPlanOutput } from "@/lib/schemas/lecture-generator";
import { MarkdownViewer } from "@/components/shared/MarkdownViewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Clock, FileSignature, FileText, HelpCircle, Lightbulb, List, MessageSquare, Package, Target, Users } from "lucide-react";

interface SessionPlanDisplayProps {
  data: GenerateSessionPlanOutput;
}

export const SessionPlanDisplay = ({ data }: SessionPlanDisplayProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <BookOpen className="mr-3 h-7 w-7 text-primary" />
          {data.sessionTitle}
        </CardTitle>
        <CardDescription>A detailed, interactive session plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goals and Objectives */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
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
        </div>

        {/* Activities */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <List className="mr-2 h-6 w-6" /> Session Activities
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {data.activities.map((activity, index) => (
              <AccordionItem value={`item-${index}`} key={`activity-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {index + 1}. {activity.title}
                </AccordionTrigger>
                <AccordionContent className="space-y-6 border-l-2 ml-2 pl-4">
                  <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
                    <Badge variant="secondary" className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {activity.duration} mins
                    </Badge>
                    <Badge variant="outline" className="capitalize flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {activity.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center"><HelpCircle className="mr-2 h-4 w-4" /> Objective</h4>
                    <p className="text-muted-foreground">{activity.objective}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center"><List className="mr-2 h-4 w-4" /> Instructions</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownViewer content={activity.instructions} />
                    </div>
                  </div>
                  {activity.exampleLookFor && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center"><Lightbulb className="mr-2 h-4 w-4" /> Example of What to Look For</h4>
                      <p className="text-sm p-3 bg-muted rounded-md text-muted-foreground whitespace-pre-wrap">{activity.exampleLookFor}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Discussion Questions</h4>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {activity.discussion.map((q, qIndex) => <li key={`q-${index}-${qIndex}`}>{q}</li>)}
                    </ul>
                  </div>
                  {activity.materials && activity.materials.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
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
            ))}
          </Accordion>
        </div>

        {/* Appendix */}
        {data.appendix && data.appendix.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FileSignature className="mr-2 h-6 w-6" /> Appendix
            </h3>
            <div className="space-y-4">
              {data.appendix.map((handout, index) => (
                <Card key={`handout-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{handout.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm dark:prose-invert max-w-none"><MarkdownViewer content={handout.content} /></CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Closing Summary */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Closing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{data.closingSummary}</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
