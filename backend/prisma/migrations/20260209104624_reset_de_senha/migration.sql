-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nick" VARCHAR(16) NOT NULL,
    "nome_completo" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "nivel_acesso" VARCHAR(20) DEFAULT 'user',
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "birthday" DATE,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "icone" VARCHAR(500) NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "descricao" VARCHAR(425) NOT NULL,
    "infos_uteis" VARCHAR(200) NOT NULL,
    "ordem" INTEGER DEFAULT 0,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "data" VARCHAR(50) NOT NULL,
    "video_url" VARCHAR(500) NOT NULL,
    "descricao" VARCHAR(425) NOT NULL,
    "post_link" VARCHAR(100) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "avatar" VARCHAR(100) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "stars" INTEGER DEFAULT 1,
    "descricao" VARCHAR(425) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nick_key" ON "usuarios"("nick");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_nome_key" ON "jobs"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_descricao_key" ON "jobs"("descricao");
