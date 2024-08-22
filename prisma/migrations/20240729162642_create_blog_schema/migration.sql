-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "meta_title" TEXT NOT NULL,
    "meta_tags" TEXT NOT NULL,
    "meta_description" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "read_time" TEXT NOT NULL,
    "blog_short_content1" TEXT NOT NULL,
    "blog_content" TEXT NOT NULL,
    "banner_content" TEXT NOT NULL,
    "blog_short_content2" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "status" TEXT NOT NULL,
    "banner_image" TEXT,
    "routename" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);
