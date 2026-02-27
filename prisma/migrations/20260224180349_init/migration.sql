-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "source" TEXT NOT NULL DEFAULT 'Contact Form',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productName" TEXT
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
