-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "assunto" VARCHAR(100) NOT NULL,
    "mensagem" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'em espera',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "enviarArquivo" JSONB DEFAULT '[]',

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
