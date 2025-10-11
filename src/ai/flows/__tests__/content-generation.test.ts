/**
 * اختبارات شاملة لـ Content Generation Flows
 * تغطي جميع وظائف إنشاء المحتوى والحالات الحدية ومعالجة الأخطاء
 */

import {
    GenerateCodeInput,
    GenerateCodeOutput,
    GenerateCodebaseInput,
    GenerateCodebaseOutput,
    GenerateTextInput,
    GenerateTextOutput,
    IdeaGenerationInput,
    IdeaGenerationOutput
} from '@/ai/schemas';
import {
    generateCode,
    generateCodebase,
    generateIdeas,
    generateText
} from '../content-generation';

// Mock the AI system
jest.mock('@/ai/genkit', () => ({
    ai: {
        defineFlow: jest.fn((config, handler) => handler)
    }
}));

// Mock the prompts
jest.mock('@/ai/prompts/generate-text', () => ({
    generateTextPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-ideas', () => ({
    generateIdeasPrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-code', () => ({
    generateCodePrompt: jest.fn()
}));

jest.mock('@/ai/prompts/generate-codebase', () => ({
    generateCodebasePrompt: jest.fn()
}));

describe('Content Generation Flows', () => {
    describe('generateText', () => {
        const mockInput: GenerateTextInput = {
            prompt: 'اكتب مقالاً عن فوائد الذكاء الاصطناعي في التعليم'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate text successfully', async () => {
            // Arrange
            const mockTextResult: GenerateTextOutput = {
                generatedText: '# فوائد الذكاء الاصطناعي في التعليم\n\nالذكاء الاصطناعي يحول التعليم بشكل جذري...'
            };

            const { generateTextPrompt } = require('@/ai/prompts/generate-text');
            generateTextPrompt.mockResolvedValue({ output: mockTextResult });

            // Act
            const result = await generateText(mockInput);

            // Assert
            expect(generateTextPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockTextResult);
            expect(result.generatedText).toContain('فوائد الذكاء الاصطناعي');
            expect(result.generatedText).toContain('يحول التعليم');
        });

        it('should handle different text types', async () => {
            // Arrange
            const blogPostInput: GenerateTextInput = {
                prompt: 'اكتب منشور مدونة عن التكنولوجيا الحديثة'
            };

            const { generateTextPrompt } = require('@/ai/prompts/generate-text');
            generateTextPrompt.mockResolvedValue({
                output: {
                    generatedText: '# التكنولوجيا الحديثة\n\nمنشور مدونة عن أحدث التطورات التقنية...'
                }
            });

            // Act
            const result = await generateText(blogPostInput);

            // Assert
            expect(result.generatedText).toContain('منشور مدونة');
            expect(result.generatedText).toContain('التطورات التقنية');
        });

        it('should handle short prompts', async () => {
            // Arrange
            const shortPromptInput: GenerateTextInput = {
                prompt: 'اكتب قصة قصيرة'
            };

            const { generateTextPrompt } = require('@/ai/prompts/generate-text');
            generateTextPrompt.mockResolvedValue({
                output: {
                    generatedText: 'كان هناك رجل عجوز يعيش في قرية صغيرة...'
                }
            });

            // Act
            const result = await generateText(shortPromptInput);

            // Assert
            expect(result.generatedText).toContain('رجل عجوز');
            expect(result.generatedText).toContain('قرية صغيرة');
        });

        it('should handle empty prompts', async () => {
            // Arrange
            const emptyPromptInput: GenerateTextInput = {
                prompt: ''
            };

            const { generateTextPrompt } = require('@/ai/prompts/generate-text');
            generateTextPrompt.mockResolvedValue({
                output: {
                    generatedText: 'لا يمكن إنشاء نص بدون محفز واضح'
                }
            });

            // Act
            const result = await generateText(emptyPromptInput);

            // Assert
            expect(result.generatedText).toContain('لا يمكن إنشاء نص');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                prompt: 123
            };

            // Act & Assert
            await expect(generateText(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('generateIdeas', () => {
        const mockInput: IdeaGenerationInput = {
            specialization: 'تطوير البرمجيات',
            domain: 'التجارة الإلكترونية',
            region: 'الشرق الأوسط',
            circumstances: 'النمو السريع في التجارة الإلكترونية',
            additionalContext: 'التركيز على الحلول المحلية'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate ideas successfully', async () => {
            // Arrange
            const mockIdeasResult: IdeaGenerationOutput = {
                ideas: [
                    {
                        title: 'منصة تجارة إلكترونية للمنتجات المحلية',
                        description: 'منصة تسمح للبائعين المحليين ببيع منتجاتهم عبر الإنترنت مع دعم الدفع المحلي'
                    },
                    {
                        title: 'تطبيق توصيل ذكي',
                        description: 'تطبيق يستخدم الذكاء الاصطناعي لتحسين طرق التوصيل وتقليل التكاليف'
                    }
                ]
            };

            const { generateIdeasPrompt } = require('@/ai/prompts/generate-ideas');
            generateIdeasPrompt.mockResolvedValue({ output: mockIdeasResult });

            // Act
            const result = await generateIdeas(mockInput);

            // Assert
            expect(generateIdeasPrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockIdeasResult);
            expect(result.ideas).toHaveLength(2);
            expect(result.ideas[0].title).toContain('تجارة إلكترونية');
            expect(result.ideas[1].title).toContain('توصيل ذكي');
        });

        it('should handle different specializations', async () => {
            // Arrange
            const marketingInput: IdeaGenerationInput = {
                specialization: 'التسويق الرقمي',
                domain: 'الرعاية الصحية',
                region: 'أوروبا',
                circumstances: 'زيادة الوعي بالصحة النفسية',
                additionalContext: 'التركيز على الحلول الرقمية'
            };

            const { generateIdeasPrompt } = require('@/ai/prompts/generate-ideas');
            generateIdeasPrompt.mockResolvedValue({
                output: {
                    ideas: [
                        {
                            title: 'تطبيق الصحة النفسية',
                            description: 'تطبيق يوفر جلسات استشارية عبر الإنترنت للصحة النفسية'
                        }
                    ]
                }
            });

            // Act
            const result = await generateIdeas(marketingInput);

            // Assert
            expect(result.ideas[0].title).toContain('الصحة النفسية');
            expect(result.ideas[0].description).toContain('استشارية');
        });

        it('should handle minimal input', async () => {
            // Arrange
            const minimalInput: IdeaGenerationInput = {
                specialization: 'التصميم'
                // other fields are optional
            };

            const { generateIdeasPrompt } = require('@/ai/prompts/generate-ideas');
            generateIdeasPrompt.mockResolvedValue({
                output: {
                    ideas: [
                        {
                            title: 'فكرة تصميم عامة',
                            description: 'فكرة تصميم مبتكرة بدون تفاصيل محددة'
                        }
                    ]
                }
            });

            // Act
            const result = await generateIdeas(minimalInput);

            // Assert
            expect(result.ideas[0].title).toContain('تصميم');
            expect(result.ideas[0].description).toContain('مبتكرة');
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                specialization: 123
            };

            // Act & Assert
            await expect(generateIdeas(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('generateCode', () => {
        const mockInput: GenerateCodeInput = {
            prompt: 'أنشئ مكون React لعرض قائمة المنتجات'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate code successfully', async () => {
            // Arrange
            const mockCodeResult: GenerateCodeOutput = {
                html: '<div class="product-list">\n  <h2>قائمة المنتجات</h2>\n  <ul>\n    <li>منتج 1</li>\n    <li>منتج 2</li>\n  </ul>\n</div>',
                css: '.product-list {\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\n.product-list h2 {\n  color: #333;\n  margin-bottom: 15px;\n}',
                javascript: 'function ProductList({ products }) {\n  return (\n    <div className="product-list">\n      <h2>قائمة المنتجات</h2>\n      <ul>\n        {products.map(product => (\n          <li key={product.id}>{product.name}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}'
            };

            const { generateCodePrompt } = require('@/ai/prompts/generate-code');
            generateCodePrompt.mockResolvedValue({ output: mockCodeResult });

            // Act
            const result = await generateCode(mockInput);

            // Assert
            expect(generateCodePrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockCodeResult);
            expect(result.html).toContain('product-list');
            expect(result.css).toContain('.product-list');
            expect(result.javascript).toContain('ProductList');
        });

        it('should handle different component types', async () => {
            // Arrange
            const formInput: GenerateCodeInput = {
                prompt: 'أنشئ نموذج تسجيل دخول'
            };

            const { generateCodePrompt } = require('@/ai/prompts/generate-code');
            generateCodePrompt.mockResolvedValue({
                output: {
                    html: '<form class="login-form">\n  <input type="email" placeholder="البريد الإلكتروني">\n  <input type="password" placeholder="كلمة المرور">\n  <button type="submit">تسجيل الدخول</button>\n</form>',
                    css: '.login-form {\n  max-width: 400px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n.login-form input {\n  width: 100%;\n  margin-bottom: 10px;\n  padding: 10px;\n}',
                    javascript: 'function LoginForm() {\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // Handle login logic\n  };\n\n  return (\n    <form className="login-form" onSubmit={handleSubmit}>\n      <input type="email" placeholder="البريد الإلكتروني" required />\n      <input type="password" placeholder="كلمة المرور" required />\n      <button type="submit">تسجيل الدخول</button>\n    </form>\n  );\n}'
                }
            });

            // Act
            const result = await generateCode(formInput);

            // Assert
            expect(result.html).toContain('login-form');
            expect(result.css).toContain('.login-form');
            expect(result.javascript).toContain('LoginForm');
        });

        it('should handle code without JavaScript', async () => {
            // Arrange
            const staticInput: GenerateCodeInput = {
                prompt: 'أنشئ صفحة HTML ثابتة لعرض معلومات الشركة'
            };

            const { generateCodePrompt } = require('@/ai/prompts/generate-code');
            generateCodePrompt.mockResolvedValue({
                output: {
                    html: '<div class="company-info">\n  <h1>معلومات الشركة</h1>\n  <p>شركة رائدة في مجال التكنولوجيا</p>\n</div>',
                    css: '.company-info {\n  text-align: center;\n  padding: 40px;\n}\n\n.company-info h1 {\n  color: #2c3e50;\n  margin-bottom: 20px;\n}'
                    // javascript is optional
                }
            });

            // Act
            const result = await generateCode(staticInput);

            // Assert
            expect(result.html).toContain('company-info');
            expect(result.css).toContain('.company-info');
            expect(result.javascript).toBeUndefined();
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                prompt: 123
            };

            // Act & Assert
            await expect(generateCode(invalidInput as any)).rejects.toThrow();
        });
    });

    describe('generateCodebase', () => {
        const mockInput: GenerateCodebaseInput = {
            proposal: {
                title: 'منصة التجارة الإلكترونية',
                category: 'تطوير البرمجيات',
                projectDescription: 'منصة شاملة للتجارة الإلكترونية',
                techStack: ['React', 'Node.js', 'MongoDB'],
                architecture: 'MVC'
            }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate codebase successfully', async () => {
            // Arrange
            const mockCodebaseResult: GenerateCodebaseOutput = {
                codebase: 'Generated codebase content...'
            };

            const { generateCodebasePrompt } = require('@/ai/prompts/generate-codebase');
            generateCodebasePrompt.mockResolvedValue({ output: mockCodebaseResult });

            // Act
            const result = await generateCodebase(mockInput);

            // Assert
            expect(generateCodebasePrompt).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockCodebaseResult);
            expect(result).toEqual(mockCodebaseResult);
        });

        it('should handle different architectures', async () => {
            // Arrange
            const microservicesInput: GenerateCodebaseInput = {
                proposal: {
                    title: 'نظام الخدمات المصغرة',
                    category: 'تطوير البرمجيات',
                    projectDescription: 'نظام يستخدم معمارية الخدمات المصغرة',
                    techStack: ['Docker', 'Kubernetes', 'Node.js'],
                    architecture: 'microservices'
                }
            };

            const { generateCodebasePrompt } = require('@/ai/prompts/generate-codebase');
            generateCodebasePrompt.mockResolvedValue({
                output: {
                    codebase: 'Microservices codebase...'
                }
            });

            // Act
            const result = await generateCodebase(microservicesInput);

            // Assert
            expect(result).toEqual({ codebase: 'Microservices codebase...' });
        });

        it('should handle different tech stacks', async () => {
            // Arrange
            const pythonInput: GenerateCodebaseInput = {
                proposal: {
                    title: 'تطبيق Python',
                    category: 'تطوير البرمجيات',
                    projectDescription: 'تطبيق ويب باستخدام Python و Django',
                    techStack: ['Python', 'Django', 'PostgreSQL'],
                    architecture: 'MVC'
                }
            };

            const { generateCodebasePrompt } = require('@/ai/prompts/generate-codebase');
            generateCodebasePrompt.mockResolvedValue({
                output: {
                    codebase: 'Python Django codebase...'
                }
            });

            // Act
            const result = await generateCodebase(pythonInput);

            // Assert
            expect(result).toEqual({ codebase: 'Python Django codebase...' });
        });

        it('should validate input schema', async () => {
            // Arrange
            const invalidInput = {
                proposal: 'invalid'
            };

            // Act & Assert
            await expect(generateCodebase(invalidInput as any)).rejects.toThrow();
        });
    });
});
