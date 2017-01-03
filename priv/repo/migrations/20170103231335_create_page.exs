defmodule Quasar.Repo.Migrations.CreatePage do
  use Ecto.Migration

  def change do
    create table(:pages) do
      add :user_id, references(:users)
      add :title, :string, default: ""
      add :content, :text
      add :is_trashed, :boolean, default: false
      add :is_favorite, :boolean, default: false

      timestamps()
    end
    create index(:pages, [:user_id])

    create table(:pages_tags, primary_key: false) do
      add :page_id, references(:pages, on_delete: :delete_all), null: false
      add :tag_id, references(:tags, on_delete: :delete_all), null: false
    end
    create index(:pages_tags, [:tag_id, :page_id], unique: true)

    execute "CREATE EXTENSION unaccent"
    execute "CREATE EXTENSION pg_trgm"
    # execute "CREATE INDEX pages_title_content_trgm_index ON pages USING GIN (title gin_trgm_ops, content gin_trgm_ops);"
    execute "CREATE INDEX idx_fts_pages ON pages USING GIN((setweight(to_tsvector('simple', title),'A') || setweight(to_tsvector('simple', content), 'B')));"
  end
end
