defmodule Quasar.Repo.Migrations.CreateUser do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string, null: false
      add :name, :string
      add :password_hash, :string, null: false
      add :reset_token, :string
      add :reset_token_at, :utc_datetime
      add :settings, :map

      timestamps()
    end
    create unique_index(:users, [:email])
  end
end
