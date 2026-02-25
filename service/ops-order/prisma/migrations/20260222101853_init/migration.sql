-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "gameAccountId" TEXT NOT NULL,
    "universalAccountId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "fcmToken" TEXT NOT NULL,
    "realmId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "platform" TEXT NOT NULL DEFAULT 'unknown',
    "blackList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "basic" BOOLEAN NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountTopic" (
    "accountId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "AccountTopic_pkey" PRIMARY KEY ("accountId","topicId")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_gameAccountId_key" ON "Account"("gameAccountId");

-- CreateIndex
CREATE INDEX "Account_gameAccountId_idx" ON "Account"("gameAccountId");

-- CreateIndex
CREATE INDEX "Account_realmId_idx" ON "Account"("realmId");

-- CreateIndex
CREATE INDEX "Account_realmId_blackList_idx" ON "Account"("realmId", "blackList");

-- CreateIndex
CREATE INDEX "Account_universalAccountId_idx" ON "Account"("universalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE INDEX "Topic_name_idx" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TopicType_type_key" ON "TopicType"("type");

-- CreateIndex
CREATE INDEX "TopicType_type_idx" ON "TopicType"("type");

-- CreateIndex
CREATE INDEX "TopicType_type_locked_idx" ON "TopicType"("type", "locked");

-- CreateIndex
CREATE INDEX "Journal_action_idx" ON "Journal"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Template_name_key" ON "Template"("name");

-- CreateIndex
CREATE INDEX "Template_name_idx" ON "Template"("name");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TopicType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTopic" ADD CONSTRAINT "AccountTopic_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTopic" ADD CONSTRAINT "AccountTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
