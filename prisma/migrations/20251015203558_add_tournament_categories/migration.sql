-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "tournament_categories" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "sporTuru" "SportType" NOT NULL DEFAULT 'FOOTBALL',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_categories_ad_key" ON "tournament_categories"("ad");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tournament_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
