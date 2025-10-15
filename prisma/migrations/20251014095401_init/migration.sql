-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "tcNo" TEXT NOT NULL,
    "eposta" TEXT NOT NULL,
    "telNo" TEXT NOT NULL,
    "dogumTarihi" TIMESTAMP(3) NOT NULL,
    "sifre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tcNo_key" ON "users"("tcNo");

-- CreateIndex
CREATE UNIQUE INDEX "users_eposta_key" ON "users"("eposta");
