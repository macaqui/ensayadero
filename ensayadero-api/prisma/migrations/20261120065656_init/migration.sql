-- CreateTable
CREATE TABLE "Instrumento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitante" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fin" DATETIME NOT NULL,
    "instrumentoId" INTEGER NOT NULL,
    "creadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reserva_instrumentoId_fkey" FOREIGN KEY ("instrumentoId") REFERENCES "Instrumento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Instrumento_nombre_key" ON "Instrumento"("nombre");

-- CreateIndex
CREATE INDEX "Reserva_instrumentoId_inicio_fin_idx" ON "Reserva"("instrumentoId", "inicio", "fin");
