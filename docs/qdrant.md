Based on the n8n workflows you've built (the Scopus Ingestion and the AI Query pipeline), here is the complete technical specification for your Qdrant collection.

Since you are using the **`nomic-embed-text`** model via Ollama, these specific vector dimensions and metrics are mandatory for the system to work.

---

# Setup Collection : `academic_research`

## 1. Overview
*   **Collection Name:** `academic_research`
*   **Use Case:** Retrieval Augmented Generation (RAG) for academic research. This collection stores semantic embeddings of Scopus paper metadata to allow an AI Agent to retrieve relevant scholarly articles based on natural language queries.
*   **Distance Metric:** `Cosine`
    *   *(Reason: Nomic and most text-embedding models are optimized for Cosine similarity to measure the angle between two vectors, regardless of magnitude.)*
*   **Vector Size:** `768`
    *   *(Reason: This is the native output dimension for the `nomic-embed-text` model.)*

## 2. Data Schema (Payload)
The payload stores the original metadata so the AI Agent can cite sources and the user can click links.

| Field Name | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `text` | String | The combined string used for embedding (Title + Author + Journal + Year). | "Title: Attention is All You Need... Author: Vaswani..." |
| `title` | String | The full title of the academic paper. | "Attention is All You Need" |
| `author` | String | The primary creator/author of the paper. | "Ashish Vaswani" |
| `doi` | String | Digital Object Identifier for permanent linking. | "10.1038/s41586-020-2649-2" |
| `year` | Integer | The publication year (extracted from coverDate). | `2023` |
| `journal` | String | The name of the publishing journal or conference. | "Nature" |
| `scopusId` | String | The unique Elsevier Scopus identifier (EID). | "2-s2.0-8500000000" |

## 3. Payload Indexes
To ensure the RAG pipeline remains fast as your database grows, and to allow the AI Agent to perform "Filtered Searches" (e.g., *"Find papers from 2024 only"*), the following indexes should be created:

| Field | Index Type | Purpose |
| :--- | :--- | :--- |
| `year` | **Integer Index** | Allows fast range filtering (e.g., `year >= 2020`). |
| `author` | **Keyword Index** | Allows exact matching for specific researcher searches. |
| `scopusId` | **Keyword Index** | Ensures fast lookups for unique document IDs to prevent duplicates. |
| `journal` | **Keyword Index** | Allows filtering by specific high-impact journals. |

---

### 🛠️ Implementation Note (Qdrant API / Console)
If you are creating this collection via the Qdrant Dashboard or API (rather than letting n8n create it automatically), use this JSON configuration:

```json
PUT /collections/academic_research
{
  "vectors": {
    "size": 768,
    "distance": "Cosine"
  }
}
```

**To add the indexes (via API):**
```json
POST /collections/academic_research/index
{
  "field_name": "year",
  "field_schema": "integer"
}
```
*(Repeat for `author`, `scopusId`, and `journal` using `"field_schema": "keyword"`)*
