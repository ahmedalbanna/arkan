This document outlines the architecture and functionality of the WPS Office-style integration, a feature designed to provide a familiar and comprehensive document management experience within the application.

## 1. Core Concept

The WPS integration simulates a multi-tab document editor, allowing users to work on different file types (documents, presentations, spreadsheets) within a single, unified interface. It manages a persistent state for open tabs and active content, providing a seamless workflow similar to a desktop office suite.

## 2. Key Components

### `HomePage` (`src/components/wps/HomePage.tsx`)

-   **Purpose**: The main container and entry point for the WPS feature.
-   **State Management**: It manages the state of all open document tabs, including which tab is currently active. It handles the logic for adding and removing tabs.
-   **Routing**: It dynamically renders the appropriate content based on the active tab's type (`home`, `new`, `word`, `powerpoint`, etc.).

### `DocumentTabs` (`src/components/wps/DocumentTabs.tsx`)

-   **Purpose**: Renders the tab bar UI, allowing users to switch between open documents or create new ones.
-   **Functionality**: Displays an icon corresponding to the file type and provides controls for closing tabs.

### `CreateNewPage` (`src/components/wps/CreateNewPage.tsx`)

-   **Purpose**: Serves as the "New" tab, offering users a template browser to create new documents, presentations, or spreadsheets.
-   **Template-Driven**: It displays a variety of templates for different document types, which, when clicked, open in a new editor tab.

### `EditorLayout` (`src/components/editor/EditorLayout.tsx`)

-   **Purpose**: A generic layout that wraps the specific editor for a given file type (e.g., `RichTextEditor`, `PresentationEditor`).
-   **Toolbar Integration**: It includes the main `EditorToolbar`, which in turn loads the context-specific toolbar for the active document type.

## 3. Workflow

1.  The user navigates to the `/wps` page, which renders the `HomePage`.
2.  The `HomePage` displays the `DocumentTabs` (initially with just a "Home" tab) and a navigation rail on the left.
3.  The user can click "New" or a specific document type like "Docs" from the navigation rail.
4.  This action opens the `CreateNewPage` view within a new tab.
5.  From the `CreateNewPage`, the user selects a template (e.g., "Blank Document").
6.  Clicking a template calls the `addTab` function, which adds a new tab for the editor (e.g., a 'word' type tab) and sets it as active.
7.  The `HomePage` component detects the new active tab's type and renders the `EditorLayout`.
8.  The `EditorLayout` then renders the appropriate editor (e.g., `RichTextEditor` for 'word' tabs), providing a complete, in-app document editing experience.
