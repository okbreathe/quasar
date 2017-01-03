defmodule Quasar.Wiki.Page do
  use Quasar.Web, :model

  alias Quasar.Repo
  alias Quasar.Wiki.{Page, Tag}
  import Ecto.Query
  import Enum

  schema "pages" do
    field :title, :string
    field :content, :string
    field :is_trashed, :boolean, default: false
    field :is_favorite, :boolean, default: false

    belongs_to :user, Quasar.Accounts.User
    many_to_many :tags, Tag, join_through: "pages_tags", on_delete: :delete_all, on_replace: :delete
    timestamps()
  end

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:user_id, :title, :content, :is_trashed, :is_favorite])
    |> assoc_constraint(:user)
    |> put_assoc(:tags, set_tags(struct, params))
  end

  def search(current_user, query) do
    query = query
            |> String.split(" ")
            |> map(fn (q) -> "#{q}:*" end)
            |> join(" & ")
    p_search = from p in Page, select: %{
      id: p.id,
      user_id: p.user_id,
      document: fragment("setweight(to_tsvector('simple', unaccent(?)), 'A') || setweight(to_tsvector('simple', unaccent(?)), 'B')", p.title, p.content)
    }

    Repo.all(
      from p in subquery(p_search),
      select: %{
        id: p.id,
        rank: fragment("ts_rank(?, to_tsquery('simple', ?))", p.document, ^query)
      },
      where: p.user_id == ^current_user.id and fragment("? @@ to_tsquery('simple', ?)", p.document, ^query),
      order_by: fragment("ts_rank(?, to_tsquery('simple', ?)) DESC", p.document,  ^query)
    )
  end

  defp set_tags(struct, params) do
    case params["tags"] do
       tags when is_list(tags)   -> build_tag_list(tags |> map(fn(t) -> t["name"] end))
       tags when is_binary(tags) -> build_tag_list(tags |> String.split(","))
       _                         -> struct.tags
    end
  end

  defp build_tag_list(tags) do
    tags
    |> map(&String.trim/1)
    |> reject(& &1 == "")
    |> map(&String.downcase/1)
    |> uniq
    |> insert_and_get_all
  end

  defp insert_and_get_all([]) do
    []
  end

  defp insert_and_get_all(names) do
    current_time = Timex.now
    maps = map(names, &%{name: &1, inserted_at: current_time, updated_at: current_time})
    Repo.insert_all Tag, maps, on_conflict: :nothing
    Repo.all(from t in Tag, where: t.name in ^names)
  end
end
