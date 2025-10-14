/**
 * مثال على استخدام hooks الذكاء الاصطناعي الجديدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد لأدوات الذكاء الاصطناعي
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    useAdvancedGenerationNew,
    useAdvancedWritingToolsNew,
    type FileProcessingRequest,
    type GenerationRequest,
    type WritingToolRequest
} from '@/hooks/use-ai-tools-new';
import {
    Bot,
    Brain,
    CheckCircle,
    Code,
    FileText,
    Loader2,
    Search,
    Sparkles,
    Target,
    Wand2
} from 'lucide-react';
import { useState } from 'react';

/**
 * مكون أدوات الكتابة الجديد
 */
export function WritingToolsNew() {
  const {
    handleImproveText,
    handleSummarizeText,
    handleParaphraseText,
    handleDetectAIContent,
    handleFactCheck,
    handlePlagiarismCheck,
    handleAIResearcher,
    handleTopicExplainer,
    isImproving,
    isSummarizing,
    isParaphrasing,
    isDetectingAI,
    isFactChecking,
    isPlagiarismChecking,
    isResearching,
    isExplaining,
    improveResult,
    summarizeResult,
    paraphraseResult,
    detectAIResult,
    factCheckResult,
    plagiarismCheckResult,
    aiResearcherResult,
    topicExplainerResult
  } = useAdvancedWritingToolsNew();

  const [inputText, setInputText] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [explainTopic, setExplainTopic] = useState('');

  const handleToolAction = (tool: string) => {
    if (!inputText.trim()) return;

    const data: WritingToolRequest = { text: inputText };

    switch (tool) {
      case 'improve':
        handleImproveText(data);
        break;
      case 'summarize':
        handleSummarizeText(data);
        break;
      case 'paraphrase':
        handleParaphraseText(data);
        break;
      case 'detect-ai':
        handleDetectAIContent(data);
        break;
      case 'fact-check':
        handleFactCheck(data);
        break;
      case 'plagiarism-check':
        handlePlagiarismCheck(data);
        break;
    }
  };

  const handleResearch = () => {
    if (!researchTopic.trim()) return;
    handleAIResearcher({ topic: researchTopic });
  };

  const handleExplain = () => {
    if (!explainTopic.trim()) return;
    handleTopicExplainer({ topic: explainTopic });
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h2 className="text-2xl font-bold">أدوات الكتابة الذكية</h2>
        <p className="text-gray-600">استخدم الذكاء الاصطناعي لتحسين كتابتك</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Wand2 className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">أدوات الكتابة</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">العمليات المكتملة</p>
                <p className="text-2xl font-bold">
                  {[improveResult, summarizeResult, paraphraseResult, detectAIResult, factCheckResult, plagiarismCheckResult, aiResearcherResult, topicExplainerResult].filter(Boolean).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">العمليات الجارية</p>
                <p className="text-2xl font-bold">
                  {[isImproving, isSummarizing, isParaphrasing, isDetectingAI, isFactChecking, isPlagiarismChecking, isResearching, isExplaining].filter(Boolean).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">نسبة النجاح</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات الكتابة */}
      <Tabs defaultValue="writing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="writing">أدوات الكتابة</TabsTrigger>
          <TabsTrigger value="research">البحث الذكي</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="writing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أدوات تحسين النص</CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي لتحسين وتطوير نصوصك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text-input">النص المراد تحسينه</Label>
                <Textarea
                  id="text-input"
                  placeholder="أدخل النص الذي تريد تحسينه..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleToolAction('improve')}
                  disabled={isImproving || !inputText.trim()}
                  className="w-full"
                >
                  {isImproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحسين...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      تحسين النص
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleToolAction('summarize')}
                  disabled={isSummarizing || !inputText.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التلخيص...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      تلخيص النص
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleToolAction('paraphrase')}
                  disabled={isParaphrasing || !inputText.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isParaphrasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري إعادة الصياغة...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      إعادة صياغة
                    </>
                  )}
                </Button>
              </div>

              {/* النتائج */}
              {(improveResult || summarizeResult || paraphraseResult) && (
                <Card>
                  <CardHeader>
                    <CardTitle>النتائج</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {improveResult && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">النص المحسن:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{improveResult.result}</p>
                      </div>
                    )}
                    {summarizeResult && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">الملخص:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{summarizeResult.result}</p>
                      </div>
                    )}
                    {paraphraseResult && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">النص المعاد صياغته:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{paraphraseResult.result}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>البحث الذكي</CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي للبحث في أي موضوع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="research-topic">موضوع البحث</Label>
                <Input
                  id="research-topic"
                  placeholder="أدخل موضوع البحث..."
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                />
              </div>

              <Button
                onClick={handleResearch}
                disabled={isResearching || !researchTopic.trim()}
                className="w-full"
              >
                {isResearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    بدء البحث الذكي
                  </>
                )}
              </Button>

              {/* نتيجة البحث */}
              {aiResearcherResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>نتائج البحث</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded">
                      {aiResearcherResult.result}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>شرح المواضيع</CardTitle>
              <CardDescription>
                احصل على شرح مفصل لأي موضوع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="explain-topic">الموضوع المراد شرحه</Label>
                <Input
                  id="explain-topic"
                  placeholder="أدخل الموضوع المراد شرحه..."
                  value={explainTopic}
                  onChange={(e) => setExplainTopic(e.target.value)}
                />
              </div>

              <Button
                onClick={handleExplain}
                disabled={isExplaining || !explainTopic.trim()}
                className="w-full"
                variant="outline"
              >
                {isExplaining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الشرح...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    شرح الموضوع
                  </>
                )}
              </Button>

              {/* نتيجة الشرح */}
              {topicExplainerResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>شرح الموضوع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded">
                      {topicExplainerResult.result}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل النص</CardTitle>
              <CardDescription>
                احلل نصوصك للكشف عن المحتوى المولد بالذكاء الاصطناعي والتحقق من الحقائق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="analysis-text">النص المراد تحليله</Label>
                <Textarea
                  id="analysis-text"
                  placeholder="أدخل النص الذي تريد تحليله..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleToolAction('detect-ai')}
                  disabled={isDetectingAI || !inputText.trim()}
                  className="w-full"
                >
                  {isDetectingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      كشف الذكاء الاصطناعي
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleToolAction('fact-check')}
                  disabled={isFactChecking || !inputText.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isFactChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      التحقق من الحقائق
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleToolAction('plagiarism-check')}
                  disabled={isPlagiarismChecking || !inputText.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isPlagiarismChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      كشف الانتحال
                    </>
                  )}
                </Button>
              </div>

              {/* نتائج التحليل */}
              {(detectAIResult || factCheckResult || plagiarismCheckResult) && (
                <Card>
                  <CardHeader>
                    <CardTitle>نتائج التحليل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detectAIResult && (
                      <div>
                        <h4 className="font-semibold mb-2">كشف الذكاء الاصطناعي:</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={detectAIResult.score > 70 ? 'destructive' : 'default'}>
                            {detectAIResult.score}% احتمالية أن يكون مولد بالذكاء الاصطناعي
                          </Badge>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded mt-2">
                          {detectAIResult.analysis}
                        </p>
                      </div>
                    )}
                    {factCheckResult && (
                      <div>
                        <h4 className="font-semibold mb-2">التحقق من الحقائق:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                          {factCheckResult.result}
                        </p>
                      </div>
                    )}
                    {plagiarismCheckResult && (
                      <div>
                        <h4 className="font-semibold mb-2">كشف الانتحال:</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={plagiarismCheckResult.score > 30 ? 'destructive' : 'default'}>
                            {plagiarismCheckResult.score}% احتمالية الانتحال
                          </Badge>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded mt-2">
                          {plagiarismCheckResult.result}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * مكون التوليد الجديد
 */
export function GenerationToolsNew() {
  const {
    handleGenerateText,
    handleGenerateCode,
    handleProcessFile,
    isGeneratingText,
    isGeneratingCode,
    isProcessingFile,
    generateTextResult,
    generateCodeResult,
    processFileResult
  } = useAdvancedGenerationNew();

  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTextGeneration = () => {
    if (!prompt.trim()) return;

    const data: GenerationRequest = {
      prompt,
      context: context.trim() || undefined,
    };

    handleGenerateText(data);
  };

  const handleCodeGeneration = () => {
    if (!prompt.trim()) return;

    const data: GenerationRequest = {
      prompt,
      context: context.trim() || undefined,
    };

    handleGenerateCode(data);
  };

  const handleFileProcessing = () => {
    if (!selectedFile) return;

    const data: FileProcessingRequest = {
      file: selectedFile,
      options: {
        extractText: true,
        generateSummary: true,
      },
    };

    handleProcessFile(data);
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h2 className="text-2xl font-bold">أدوات التوليد</h2>
        <p className="text-gray-600">استخدم الذكاء الاصطناعي لتوليد النصوص والكود</p>
      </div>

      {/* أدوات التوليد */}
      <Tabs defaultValue="text" className="space-y-6">
        <TabsList>
          <TabsTrigger value="text">توليد النص</TabsTrigger>
          <TabsTrigger value="code">توليد الكود</TabsTrigger>
          <TabsTrigger value="file">معالجة الملفات</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>توليد النص</CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي لتوليد نصوص مخصصة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">الطلب</Label>
                <Textarea
                  id="prompt"
                  placeholder="أدخل طلبك لتوليد النص..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="context">السياق (اختياري)</Label>
                <Textarea
                  id="context"
                  placeholder="أدخل السياق الإضافي..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleTextGeneration}
                disabled={isGeneratingText || !prompt.trim()}
                className="w-full"
              >
                {isGeneratingText ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    توليد النص
                  </>
                )}
              </Button>

              {/* نتيجة توليد النص */}
              {generateTextResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>النص المولد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded">
                      {generateTextResult.content}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>توليد الكود</CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي لتوليد كود مخصص
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="code-prompt">الطلب</Label>
                <Textarea
                  id="code-prompt"
                  placeholder="أدخل طلبك لتوليد الكود..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="code-context">السياق (اختياري)</Label>
                <Textarea
                  id="code-context"
                  placeholder="أدخل السياق الإضافي..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCodeGeneration}
                disabled={isGeneratingCode || !prompt.trim()}
                className="w-full"
              >
                {isGeneratingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4 mr-2" />
                    توليد الكود
                  </>
                )}
              </Button>

              {/* نتيجة توليد الكود */}
              {generateCodeResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>الكود المولد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
                      <code>{generateCodeResult.content}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معالجة الملفات</CardTitle>
              <CardDescription>
                استخدم الذكاء الاصطناعي لمعالجة وتحليل الملفات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-input">اختر الملف</Label>
                <Input
                  id="file-input"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.txt,.md,.docx"
                />
              </div>

              <Button
                onClick={handleFileProcessing}
                disabled={isProcessingFile || !selectedFile}
                className="w-full"
              >
                {isProcessingFile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    معالجة الملف
                  </>
                )}
              </Button>

              {/* نتيجة معالجة الملف */}
              {processFileResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>نتائج معالجة الملف</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {processFileResult.text && (
                      <div>
                        <h4 className="font-semibold mb-2">النص المستخرج:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                          {processFileResult.text}
                        </p>
                      </div>
                    )}
                    {processFileResult.summary && (
                      <div>
                        <h4 className="font-semibold mb-2">الملخص:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">
                          {processFileResult.summary}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * مكون العرض الرئيسي
 */
export function AIToolsDemo() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="writing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="writing">أدوات الكتابة</TabsTrigger>
          <TabsTrigger value="generation">أدوات التوليد</TabsTrigger>
        </TabsList>

        <TabsContent value="writing">
          <WritingToolsNew />
        </TabsContent>

        <TabsContent value="generation">
          <GenerationToolsNew />
        </TabsContent>
      </Tabs>
    </div>
  );
}
