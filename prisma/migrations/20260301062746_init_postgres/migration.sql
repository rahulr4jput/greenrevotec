-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "source" TEXT NOT NULL DEFAULT 'Contact Form',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productName" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "linkedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "linkedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "badge" TEXT NOT NULL DEFAULT 'New',
    "badgeColor" TEXT NOT NULL DEFAULT '#10b981',
    "IconComponent" TEXT NOT NULL DEFAULT 'FaLeaf',
    "iconColor" TEXT NOT NULL DEFAULT '#10b981',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT NOT NULL,
    "sku" TEXT,
    "mrp" DOUBLE PRECISION,
    "salePrice" DOUBLE PRECISION,
    "manufacturer" TEXT,
    "mfrPartNumber" TEXT,
    "unitCount" TEXT,
    "weight" TEXT,
    "bulletPoints" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "unit" TEXT DEFAULT 'Kg',
    "showPricing" BOOLEAN NOT NULL DEFAULT true,
    "applicableCrops" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "linkedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tag" TEXT,
    "gradient" TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #1a8c4e, #12653a)',
    "iconName" TEXT NOT NULL DEFAULT 'FaLeaf',
    "customIcon" TEXT,
    "image" TEXT NOT NULL,
    "thumbnail" TEXT,
    "contentBlocks" TEXT,
    "bulletPoints" TEXT NOT NULL,
    "additionalImages" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'English',
    "linkedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_language_key" ON "Category"("name", "language");
