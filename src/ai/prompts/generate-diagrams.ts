import { ai } from '@/ai/genkit';
import { GenerateDiagramOutputSchema } from '@/ai/schemas';
import { z } from 'genkit';

export const diagramSpecificInstructions: Record<z.infer<typeof z.enum(['useCase', 'class', 'sequence', 'activity', 'component', 'archimate', 'er']) >, string > = {
    useCase: `
### Use Case Diagram Instructions
- **Actors**: Define actors using \`actor ActorName\` or \`:"Actor Name": as ActorAlias\`.
- **Use Cases**: Define use cases inside a system boundary using \`rectangle "System Name" { ... }\`. Use cases are defined with parentheses, e.g., \`(Manage Account)\`.
- **Relationships**: Connect actors to use cases with a simple arrow \`-->\`. Use \`--up-->\` for better layout if needed.
- **Example**:
  \`\`\`plantuml
  @startuml
  left to right direction
  actor "Customer" as user
  rectangle "E-commerce Platform" {
    user --up--> (Login)
    user --> (View Products)
    (View Products) .> (Search Products) : include
    user --> (Manage Cart)
    (Manage Cart) .> (Add Item) : include
    (Manage Cart) .> (Remove Item) : include
  }
  @enduml
  \`\`\`
`,
        class: `
### Class Diagram Instructions
- **Classes**: Define classes using \`class ClassName\`. You can add attributes and methods inside curly braces \`{...}\`. Use \`+ \` for public, \`- \` for private, \`# \` for protected.
- **Relationships**:
  - **Association**: \`Class1 "1" -- "0..*" Class2\` (add cardinality).
  - **Inheritance**: \`Parent <|-- Child\`.
  - **Composition**: \`Whole *-- Part\`.
  - **Aggregation**: \`Container o-- Item\`.
- **Example**:
  \`\`\`plantuml
  @startuml
  class User {
    -userId: string
    -email: string
    +login()
    +logout()
  }
  class Order {
    -orderId: string
    -orderDate: Date
    +calculateTotal(): float
  }
  User "1" -- "0..*" Order : places
  @enduml
  \`\`\`
`,
            sequence: `
### Sequence Diagram Instructions
- **Participants**: Define participants using \`actor\`, \`participant\`, \`boundary\`, \`control\`, \`entity\`, or \`database\`.
- **Messages**: Use arrows for messages: \`->\` for synchronous, \`->>\` for asynchronous, \`-->\` for return messages.
- **Activation/Deactivation**: Use \`activate\` and \`deactivate\` to show when a participant is active.
- **Control Flow**: Use \`alt/else\` for alternatives and \`loop\` for repetitions.
- **Example**:
  \`\`\`plantuml
  @startuml
  actor User
  participant "Web App" as App
  activate User
  User -> App: POST /login
  activate App
  App -> DB: verifyCredentials()
  activate DB
  DB --> App: User data
  deactivate DB
  App --> User: Auth Token
  deactivate App
  deactivate User
  @enduml
  \`\`\`
`,
                activity: `
### Activity Diagram Instructions
- **Start/End**: Use \`start\` and \`stop\` or \`end\`.
- **Activities**: Describe activities using \`:[Action Description];\`.
- **Conditionals**: Use \`if (condition) then (label)\` and \`else (label)\`. End with \`endif\`.
- **Forks/Joins**: Use \`fork\` and \`end fork\` or \`fork again\` and \`join\`.
- **Partitions (Swimlanes)**: Use \`|SwimlaneName|\` to group activities by actor/component.
- **Example**:
  \`\`\`plantuml
  @startuml
  start
  |User|
  :Submit Login Form;
  |System|
  if (Credentials are valid?) then (yes)
    :Redirect to Dashboard;
    stop
  else (no)
    :Show Error Message;
  endif
  |User|
  :Re-enter Credentials;
  stop
  @enduml
  \`\`\`
`,
                    component: `
### Component Diagram Instructions
- **Components**: Define components using \`[ComponentName]\`.
- **Interfaces**: Define interfaces using \`() "InterfaceName"\`.
- **Relationships**:
  - **Dependency**: \`[Client] ..> [Service]\`
  - **Realization**: \`[Implementation] ..|> (Interface)\`
  - **Provided/Required Interface**: \`[Service] - (Interface)\` and \`(Interface) - [Client]\`.
- **Example**:
  \`\`\`plantuml
  @startuml
  [API Gateway]
  [Auth Service]
  () "User Authentication" as AuthInterface

  [API Gateway] ..> AuthInterface
  [Auth Service] ..|> AuthInterface
  @enduml
  \`\`\`
`,
                        archimate: `
### ArchiMate Diagram Instructions
- **Elements**: Use the format \`archimate "Element Name" as Alias <<ElementType>>\`.
- **Layers**: Group elements by layer (Business, Application, Technology).
- **Relationships**: Use standard ArchiMate relationship arrows (e.g., \`-->\`, \`..>\`).
- **Example**:
  \`\`\`plantuml
  @startuml
  archimate "CRM" as CRM <<ApplicationComponent>>
  archimate "Customer Service" as CS <<BusinessProcess>>
  CS -up-|> CRM : realizes
  @enduml
  \`\`\`
`,
                            er: `
### ER Diagram Instructions
- **Entities**: Define entities using \`entity "EntityName" { ... }\`.
- **Attributes**: Inside the entity, define attributes. Mark primary keys with \`* \` or \`PK \`.
- **Relationships**: Use crow's foot notation for cardinality:
  - **One-to-One**: \`EntityA ||--|| EntityB\`
  - **One-to-Many**: \`EntityA ||--|{ EntityB\`
  - **Many-to-Many**: Create a linking table.
- **Example**:
  \`\`\`plantuml
  @startuml
  entity "User" {
    * user_id : integer
    --
    email : varchar
  }
  entity "Post" {
    * post_id : integer
    --
    title : varchar
    user_id : integer <<FK>>
  }
  User ||--|{ Post
  @enduml
  \`\`\`
`
};

export const generateDiagramPrompt = ai.definePrompt({
    name: 'generateDiagramPrompt',
    input: { schema: z.any() },
    output: { schema: GenerateDiagramOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: async (input) => {
        const { diagramToGenerate, instructionText, proposal, projectPlan, otherSections, otherDiagrams, textContext, mediaContext } = input;

        const stringifiedProposal = proposal ? JSON.stringify(proposal, null, 2) : '';
        const stringifiedPlan = projectPlan ? JSON.stringify(projectPlan, null, 2) : '';

        return `
{{#if instructionText}}
--- USER INSTRUCTIONS ---
{{{instructionText}}}
---
{{/if}}

{{#if proposal}}
--- Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
{{/if}}

{{#if projectPlan}}
--- Project Plan ---
\`\`\`json
${stringifiedPlan}
\`\`\`
{{/if}}

{{#if otherSections}}
--- Other Report Sections ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if textContext}}
--- Additional Textual Context ---
{{#each textContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if mediaContext}}
--- Additional Media Context ---
{{#each mediaContext}}
File: {{this.fileName}}
{{media url=this.content}}
---
{{/each}}
{{/if}}

Now, generate the PlantUML code and a brief explanation based on all the provided context and the user's instructions.
`;
    },
    config: {
        temperature: 0.1, // Very low temp for precise PlantUML syntax
        maxOutputTokens: 8192,
    }
});
