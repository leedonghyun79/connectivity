-- AlterTable
ALTER TABLE "Column" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Column_slug_key" ON "Column"("slug");
