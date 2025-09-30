// import { defineEval } from '@genkit-ai/evaluator';
// import { generateReportSection } from '../flows/generate-report-section';
// import { z } from 'zod';
// import { SectionNameSchema } from '../schemas';
// import { faithfulness, answerRelevancy, maliciousness } from '@genkit-ai/evaluator';

// // Define a test case that reflects a real-world scenario for this flow.
// const sampleTestCase = {
//   name: 'Introduction for AI E-commerce System',
//   input: {
//     sectionToGenerate: 'introduction' as z.infer<typeof SectionNameSchema>,
//     proposal: {
//       title: 'AI-Powered E-commerce Recommendation System',
//       description: 'A system to provide personalized product recommendations to users, increasing engagement and sales.',
//       objectives: ['Increase user conversion rate by 15%', 'Improve user satisfaction'],
//     },
//     guidelines: ['The introduction must be engaging and clearly state the problem the project solves.', 'Mention the target audience: online shoppers.'],
//   },
// };

// // Define the evaluator for the report section generation flow.
// export const reportSectionQuality = defineEval(
//   {
//     name: 'reportSectionQuality',
//     description: 'Evaluates if the generated report section is relevant, coherent, and follows all instructions.',
//     flow: generateReportSection, // The flow we are testing
//     cases: [sampleTestCase], // The test cases to run
//     metrics: [ // Corrected: property is 'metrics', not 'scorers'
//       // Use Genkit's built-in metrics, which are now imported directly.
//       faithfulness,
//       answerRelevancy,
//       maliciousness,
//     ],
//   },
// );

// // To run this evaluation from the command line, you would execute:
// // genkit eval:run reportSectionQuality
