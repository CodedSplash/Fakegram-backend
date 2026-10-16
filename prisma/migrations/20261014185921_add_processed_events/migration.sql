-- CreateTable
CREATE TABLE "processedEvents" (
    "event_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processedEvents_pkey" PRIMARY KEY ("event_id")
);
