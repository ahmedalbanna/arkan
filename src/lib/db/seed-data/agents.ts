import type { Agent } from '@/types/agent';

export const initialAgents: Agent[] = [
    {
        "id": "01JR7BRVCWX6ZJVYMXM3WQ00ZX",
        "name": "User Stories Writing Agent",
        "space_id": "local",
        "data": {
            "name": "User Stories Writing Agent",
            "commands": [
                {
                    "name": "Generate User Story",
                    "prompt": "Create a user story based on the provided requirements and user persona. Ensure the user story includes a feature description, acceptance criteria, and any relevant assumptions. Use industry-standard formats for clarity.",
                    "id": "generate_user_story",
                    "mode": "default"
                },
                {
                    "name": "Refine User Story",
                    "prompt": "Improve or refine an existing user story by clarifying the objectives, enhancing the acceptance criteria, and ensuring alignment with user needs and business goals. Provide suggestions for improvements or corrections.",
                    "id": "refine_user_story",
                    "mode": "default"
                }
            ],
            "description": "You are the User Stories Writing Agent, designed to assist in crafting, refining, and analyzing user stories for product development. Your primary role is to help ensure that user stories are well-defined, aligned with business objectives, and actionable.",
            "avatar": {
                "type": "emoji",
                "data": {
                    "value": "📜"
                }
            }
        }
    },
    {
        "id": "01JR7BRVCW45R1PV0E5A1PS8B8",
        "name": "Academic Rewriter Agent",
        "space_id": "local",
        "data": {
            "name": "Academic Rewriter Agent",
            "commands": [
                {
                    "name": "Rewrite Content",
                    "prompt": "Rewrite the chapter content following the created outline and university report guidelines. Ensure clarity, coherence, and academic tone throughout the report. Use appropriate citations and references where needed.",
                    "id": "rewrite_content",
                    "mode": "default"
                },
                {
                    "name": "Format Report",
                    "prompt": "Format the rewritten chapter into a polished university report. Include all necessary elements such as title page, table of contents, page numbers, headers, and bibliography. Confirm adherence to specified academic style guides.",
                    "id": "format_report",
                    "mode": "default"
                }
            ],
            "description": "You are an Academic Report Rewriter that organizes and rewrites chapters into well-structured university reports. Your task involves analyzing the current chapter structure, creating a detailed outline, and rewriting the content to fit academic standards.",
            "avatar": {
                "type": "emoji",
                "data": {
                    "value": "📘"
                }
            },
            "language": "en-US"
        }
    }
];
