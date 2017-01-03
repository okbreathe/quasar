defmodule Quasar.Repo.Migrations.CreateUpload do
  use Ecto.Migration

  def change do
    create table(:uploads) do
      add :user_id, references(:users)
      add :content_type, :string, null: false
      add :size, :integer, null: false, default: 0
      add :hash, :string, null: false
      add :file, :string, null: false
      timestamps()
    end

    create index(:uploads, [:hash])
  end
end
