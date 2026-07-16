-- CreateTable
CREATE TABLE "intervention_photo" (
    "id" SERIAL NOT NULL,
    "id_intervencion" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "descripcion" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intervention_photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intervention_photo_id_intervencion_idx" ON "intervention_photo"("id_intervencion");

-- AddForeignKey
ALTER TABLE "intervention_photo" ADD CONSTRAINT "intervention_photo_id_intervencion_fkey" FOREIGN KEY ("id_intervencion") REFERENCES "intervencion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
