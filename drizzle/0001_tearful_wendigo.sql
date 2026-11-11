CREATE TABLE "article_concepts" (
	"article_id" uuid NOT NULL,
	"concept_id" integer NOT NULL,
	CONSTRAINT "article_concepts_article_id_concept_id_pk" PRIMARY KEY("article_id","concept_id")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"site" text,
	"title" text NOT NULL,
	"summary" text,
	"key_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content" text,
	"shelf" text DEFAULT 'read' NOT NULL,
	"status" text DEFAULT 'done' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "concepts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "article_concepts" ADD CONSTRAINT "article_concepts_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_concepts" ADD CONSTRAINT "article_concepts_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_title_trgm" ON "articles" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "articles_summary_trgm" ON "articles" USING gin ("summary" gin_trgm_ops);