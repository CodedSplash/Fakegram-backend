-- RenameTable
ALTER TABLE "processedEvents" RENAME TO "processed_events";

-- RenameConstraint
ALTER TABLE "processed_events" RENAME CONSTRAINT "processedEvents_pkey" TO "processed_events_pkey";

-- CreateIndex
CREATE INDEX "processed_events_processed_at_idx" ON "processed_events" USING BRIN ("processed_at");
