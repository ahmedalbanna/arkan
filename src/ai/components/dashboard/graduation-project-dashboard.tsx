/**
 * @fileOverview Graduation Project Documentation Dashboard
 * 
 * React component for generating CS/SE graduation project documentation.
 * Provides a user-friendly interface for all 12 chapters.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Loader2, 
  CheckCircle2,
  Download,
  AlertCircle
} from 'lucide-react';

// Types
interface GraduationProjectInput {
  // Metadata
  title: string;
  arabicTitle?: string;
  studentName: string;
  studentId: string;
  supervisorName: string;
  coSupervisorName?: string;
  department: string;
  university: string;
  degree: 'bachelor' | 'master' | 'phd';
  academicYear: string;
  submissionDate: string;
  
  // Project Details
  projectType: string;
  methodology: string;
  projectDescription: string;
  problemStatement: string;
  objectives: string[];
  
  // Technical
  programmingLanguages: string[];
  frameworks: string[];
  databases?: string[];
  tools: string[];
  
  // Requirements
  functionalRequirements: string[];
  nonFunctionalRequirements?: string[];
  
  // Implementation
  implementationSummary?: string;
  keyFeatures: string[];
  
  // Testing & Results
  testingApproach?: string;
  testResults?: string;
  
  // Literature
  relatedWorkSummary?: string;
  keywords: string[];
  
  // Configuration
  chaptersToGenerate?: string[];
  detailLevel: 'brief' | 'standard' | 'comprehensive';
  includeArabic: boolean;
  citationStyle: 'IEEE' | 'APA' | 'Harvard' | 'MLA' | 'Chicago';
  
  // Additional
  existingDocumentation?: string;
  specialInstructions?: string;
}

export function GraduationProjectDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('metadata');

  // Form state
  const [formData, setFormData] = useState<Partial<GraduationProjectInput>>({
    degree: 'bachelor',
    projectType: 'web_application',
    methodology: 'agile',
    detailLevel: 'standard',
    includeArabic: false,
    citationStyle: 'IEEE',
    objectives: [''],
    programmingLanguages: [''],
    frameworks: [''],
    tools: [''],
    functionalRequirements: [''],
    keyFeatures: [''],
    keywords: [''],
  });

  const projectTypes = [
    'web_application',
    'mobile_application',
    'desktop_application',
    'machine_learning',
    'data_science',
    'cybersecurity',
    'embedded_systems',
    'game_development',
    'blockchain',
    'iot',
    'cloud_computing',
    'devops',
    'ai_nlp',
    'computer_vision',
    'network_systems',
    'database_systems',
    'research_theoretical'
  ];

  const methodologies = [
    'agile',
    'scrum',
    'waterfall',
    'iterative',
    'prototype',
    'experimental',
    'design_science',
    'action_research'
  ];

  const chapters = [
    { id: 'abstract', name: 'Abstract', icon: '📄' },
    { id: 'introduction', name: 'Introduction', icon: '📖' },
    { id: 'literature_review', name: 'Literature Review', icon: '📚' },
    { id: 'methodology', name: 'Methodology', icon: '🔬' },
    { id: 'system_analysis', name: 'System Analysis', icon: '🔍' },
    { id: 'system_design', name: 'System Design', icon: '🏗️' },
    { id: 'implementation', name: 'Implementation', icon: '💻' },
    { id: 'testing', name: 'Testing', icon: '🧪' },
    { id: 'results', name: 'Results', icon: '📊' },
    { id: 'discussion', name: 'Discussion', icon: '💬' },
    { id: 'conclusion', name: 'Conclusion', icon: '🎯' },
    { id: 'recommendations', name: 'Recommendations', icon: '🔮' },
  ];

  const [selectedChapters, setSelectedChapters] = useState<string[]>(
    chapters.map(c => c.id)
  );

  const handleArrayInput = (field: keyof GraduationProjectInput, index: number, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: keyof GraduationProjectInput) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData({ ...formData, [field]: [...currentArray, ''] });
  };

  const removeArrayItem = (field: keyof GraduationProjectInput, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData({ ...formData, [field]: currentArray.filter((_, i) => i !== index) });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        objectives: formData.objectives?.filter(o => o.trim()),
        programmingLanguages: formData.programmingLanguages?.filter(l => l.trim()),
        frameworks: formData.frameworks?.filter(f => f.trim()),
        tools: formData.tools?.filter(t => t.trim()),
        functionalRequirements: formData.functionalRequirements?.filter(r => r.trim()),
        keyFeatures: formData.keyFeatures?.filter(k => k.trim()),
        keywords: formData.keywords?.filter(k => k.trim()),
        databases: formData.databases?.filter(d => d?.trim()),
        chaptersToGenerate: selectedChapters,
      };

      const response = await fetch('/api/ai/graduation-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Graduation Project Documentation Generator</CardTitle>
              <CardDescription>
                Generate comprehensive CS/SE graduation project documentation with 12 academic chapters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student & Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name *</Label>
                      <Input
                        id="studentName"
                        value={formData.studentName || ''}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId || ''}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Student ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter project title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arabicTitle">Arabic Title (Optional)</Label>
                    <Input
                      id="arabicTitle"
                      value={formData.arabicTitle || ''}
                      onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
                      placeholder="العنوان بالعربية"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supervisorName">Supervisor Name *</Label>
                      <Input
                        id="supervisorName"
                        value={formData.supervisorName || ''}
                        onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                        placeholder="Dr. Supervisor Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coSupervisorName">Co-Supervisor (Optional)</Label>
                      <Input
                        id="coSupervisorName"
                        value={formData.coSupervisorName || ''}
                        onChange={(e) => setFormData({ ...formData, coSupervisorName: e.target.value })}
                        placeholder="Dr. Co-Supervisor Name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University *</Label>
                      <Input
                        id="university"
                        value={formData.university || ''}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        placeholder="University name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Department name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree *</Label>
                      <Select
                        value={formData.degree}
                        onValueChange={(value: any) => setFormData({ ...formData, degree: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor</SelectItem>
                          <SelectItem value="master">Master</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year *</Label>
                      <Input
                        id="academicYear"
                        value={formData.academicYear || ''}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        placeholder="2023-2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="submissionDate">Submission Date *</Label>
                      <Input
                        id="submissionDate"
                        type="date"
                        value={formData.submissionDate || ''}
                        onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Project Tab */}
            <TabsContent value="project" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectType">Project Type *</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="methodology">Methodology *</Label>
                      <Select
                        value={formData.methodology}
                        onValueChange={(value) => setFormData({ ...formData, methodology: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {methodologies.map(method => (
                            <SelectItem key={method} value={method}>
                              {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Project Description *</Label>
                    <Textarea
                      id="projectDescription"
                      value={formData.projectDescription || ''}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder="Comprehensive project description..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemStatement">Problem Statement *</Label>
                    <Textarea
                      id="problemStatement"
                      value={formData.problemStatement || ''}
                      onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                      placeholder="Clear problem statement..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Objectives *</Label>
                    {formData.objectives?.map((obj, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={obj}
                          onChange={(e) => handleArrayInput('objectives', idx, e.target.value)}
                          placeholder={`Objective ${idx + 1}`}
                        />
                        {formData.objectives!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('objectives', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('objectives')}>
                      + Add Objective
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Keywords * (3-7 keywords)</Label>
                    {formData.keywords?.map((keyword, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={keyword}
                          onChange={(e) => handleArrayInput('keywords', idx, e.target.value)}
                          placeholder={`Keyword ${idx + 1}`}
                        />
                        {formData.keywords!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('keywords', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('keywords')}>
                      + Add Keyword
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Programming Languages *</Label>
                    {formData.programmingLanguages?.map((lang, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={lang}
                          onChange={(e) => handleArrayInput('programmingLanguages', idx, e.target.value)}
                          placeholder="e.g., JavaScript, Python, Java"
                        />
                        {formData.programmingLanguages!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('programmingLanguages', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('programmingLanguages')}>
                      + Add Language
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Frameworks & Libraries *</Label>
                    {formData.frameworks?.map((framework, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={framework}
                          onChange={(e) => handleArrayInput('frameworks', idx, e.target.value)}
                          placeholder="e.g., React, Node.js, TensorFlow"
                        />
                        {formData.frameworks!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('frameworks', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('frameworks')}>
                      + Add Framework
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Databases (Optional)</Label>
                    {(formData.databases || ['']).map((db, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={db}
                          onChange={(e) => {
                            const newDbs = [...(formData.databases || [''])];
                            newDbs[idx] = e.target.value;
                            setFormData({ ...formData, databases: newDbs });
                          }}
                          placeholder="e.g., PostgreSQL, MongoDB"
                        />
                        {(formData.databases || ['']).length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                databases: formData.databases?.filter((_, i) => i !== idx) 
                              });
                            }}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => {
                      setFormData({ 
                        ...formData, 
                        databases: [...(formData.databases || []), ''] 
                      });
                    }}>
                      + Add Database
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Development Tools *</Label>
                    {formData.tools?.map((tool, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={tool}
                          onChange={(e) => handleArrayInput('tools', idx, e.target.value)}
                          placeholder="e.g., VS Code, Git, Docker"
                        />
                        {formData.tools!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('tools', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('tools')}>
                      + Add Tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Functional Requirements *</Label>
                    {formData.functionalRequirements?.map((req, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => handleArrayInput('functionalRequirements', idx, e.target.value)}
                          placeholder={`Requirement ${idx + 1}`}
                        />
                        {formData.functionalRequirements!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('functionalRequirements', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('functionalRequirements')}>
                      + Add Requirement
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Features *</Label>
                    {formData.keyFeatures?.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleArrayInput('keyFeatures', idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}`}
                        />
                        {formData.keyFeatures!.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeArrayItem('keyFeatures', idx)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addArrayItem('keyFeatures')}>
                      + Add Feature
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="implementationSummary">Implementation Summary (Optional)</Label>
                    <Textarea
                      id="implementationSummary"
                      value={formData.implementationSummary || ''}
                      onChange={(e) => setFormData({ ...formData, implementationSummary: e.target.value })}
                      placeholder="Brief summary of implementation approach..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testingApproach">Testing Approach (Optional)</Label>
                    <Textarea
                      id="testingApproach"
                      value={formData.testingApproach || ''}
                      onChange={(e) => setFormData({ ...formData, testingApproach: e.target.value })}
                      placeholder="Testing methodology and approach..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testResults">Test Results Summary (Optional)</Label>
                    <Textarea
                      id="testResults"
                      value={formData.testResults || ''}
                      onChange={(e) => setFormData({ ...formData, testResults: e.target.value })}
                      placeholder="Summary of testing results..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relatedWorkSummary">Related Work Summary (Optional)</Label>
                    <Textarea
                      id="relatedWorkSummary"
                      value={formData.relatedWorkSummary || ''}
                      onChange={(e) => setFormData({ ...formData, relatedWorkSummary: e.target.value })}
                      placeholder="Summary of related work and existing solutions..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="detailLevel">Detail Level</Label>
                      <Select
                        value={formData.detailLevel}
                        onValueChange={(value: any) => setFormData({ ...formData, detailLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="citationStyle">Citation Style</Label>
                      <Select
                        value={formData.citationStyle}
                        onValueChange={(value: any) => setFormData({ ...formData, citationStyle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IEEE">IEEE</SelectItem>
                          <SelectItem value="APA">APA</SelectItem>
                          <SelectItem value="Harvard">Harvard</SelectItem>
                          <SelectItem value="MLA">MLA</SelectItem>
                          <SelectItem value="Chicago">Chicago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Checkbox
                        id="includeArabic"
                        checked={formData.includeArabic}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, includeArabic: checked as boolean })
                        }
                      />
                      <Label htmlFor="includeArabic">Include Arabic</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Chapters to Generate</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {chapters.map(chapter => (
                        <div key={chapter.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={chapter.id}
                            checked={selectedChapters.includes(chapter.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedChapters([...selectedChapters, chapter.id]);
                              } else {
                                setSelectedChapters(selectedChapters.filter(id => id !== chapter.id));
                              }
                            }}
                          />
                          <Label htmlFor={chapter.id} className="flex items-center gap-1">
                            <span>{chapter.icon}</span>
                            <span>{chapter.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions || ''}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      placeholder="Any special instructions or focus areas..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Info & Actions */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {selectedChapters.length} of {chapters.length} chapters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  ~{selectedChapters.length * 2000} words estimated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {formData.detailLevel} detail level
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={loading || !formData.title || !formData.studentName}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Generate Documentation
                  </>
                )}
              </Button>
              {selectedChapters.length > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  This may take 2-5 minutes
                </p>
              )}
            </CardContent>
          </Card>

          {/* Chapter List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chapters
                  .filter(c => selectedChapters.includes(c.id))
                  .map((chapter, idx) => (
                    <div key={chapter.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <span>{chapter.icon}</span>
                      <span>{chapter.name}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Documentation Generated Successfully
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                  <p className="text-2xl font-bold">{result.wordCount?.total?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chapters</p>
                  <p className="text-2xl font-bold">{selectedChapters.length}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Generated Chapters:</p>
                {chapters
                  .filter(c => selectedChapters.includes(c.id))
                  .map(chapter => (
                    <Badge key={chapter.id} variant="secondary">
                      {chapter.icon} {chapter.name}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
