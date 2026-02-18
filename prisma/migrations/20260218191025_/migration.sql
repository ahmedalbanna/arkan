/*
  Warnings:

  - You are about to drop the column `title` on the `indexed_documents` table. All the data in the column will be lost.
  - Added the required column `source_file` to the `indexed_documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "indexed_documents" DROP COLUMN "title",
ADD COLUMN     "chunk_size" INTEGER,
ADD COLUMN     "chunks_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "overlap" INTEGER,
ADD COLUMN     "project_id" TEXT,
ADD COLUMN     "source_file" TEXT NOT NULL,
ADD COLUMN     "timestamp" BIGINT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "file_name" DROP NOT NULL,
ALTER COLUMN "file_type" DROP NOT NULL,
ALTER COLUMN "collection_name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT,
    "guidelines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE INDEX "device_tokens_token_idx" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "sections_type_idx" ON "sections"("type");

-- CreateIndex
CREATE INDEX "indexed_documents_project_id_idx" ON "indexed_documents"("project_id");

-- CreateIndex
CREATE INDEX "indexed_documents_user_id_idx" ON "indexed_documents"("user_id");

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
