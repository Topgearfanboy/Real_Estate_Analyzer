-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "squareFootage" INTEGER,
    "yearBuilt" INTEGER,
    "landValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "landValueType" TEXT NOT NULL DEFAULT 'amount',
    "closingDate" TEXT,
    "loanType" TEXT NOT NULL DEFAULT 'fixed',
    "holdPeriod" INTEGER NOT NULL DEFAULT 60,
    "exitStrategy" TEXT NOT NULL DEFAULT 'sell',
    "refinanceDate" TEXT,
    "refinanceInterest" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "blocks" JSONB,
    "metrics" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Property_userId_idx" ON "Property"("userId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
