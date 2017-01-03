defmodule Quasar.Wiki do
  @moduledoc """
  The boundary for the Wiki system.
  """

  import Ecto.{Query, Changeset}, warn: false
  alias Ecto.Multi
  alias PaperTrail.Version
  alias Quasar.Repo
  alias Quasar.Wiki.{Page, Tag, Upload}

  @hashids Hashids.new(salt: Application.get_env(:quasar, :upload_salt))

  def list_pages(user) do
    Repo.all(
      from p in Page,
      where: p.user_id == ^user.id,
      left_join: t in assoc(p, :tags), preload: [tags: t]
    )
  end

  def search_pages(user, query), do: Page.search(user, query)

  def get_page!(user, id), do: Repo.get_by!(Page, id: id, user_id: user.id)

  def create_page(user, attrs \\ %{}) do
    %Page{ user_id: user.id }
    |> Page.changeset(attrs)
    |> Repo.insert()
  end

  def update_page(user, id, attrs \\ %{}) do
    changeset = get_page!(user, id) |> Repo.preload([:tags]) |> Page.changeset(attrs)

    # Only create a version when the content changes
    if Map.get(changeset.changes, :content) do
      with {:ok, %{ model: page }} <- PaperTrail.update(changeset, originator: user) do
        delete_stale_page_autosaves(page)
        {:ok, page}
      end
    else
      Repo.update(changeset)
    end
  end

  def delete_page(user, id) do
    Multi.new
    |> Multi.delete_all(:versions, (from v in Version, where: v.item_id == ^id and v.item_type == "Page"))
    |> Multi.delete(:page, Repo.get_by!(Page, id: id, user_id: user.id))
    |> Repo.transaction
  end

  def list_revisions(user, id) do
    page = Repo.get_by!(Page, id: id, user_id: user.id)
    Repo.all(
      from v in Version,
        where: v.item_type == "Page" and v.item_id == ^page.id,
        order_by: [desc: v.inserted_at]
    )
  end

  def create_revision(user, id) do
    page = get_page!(user, id) |> Repo.preload([:tags])
    changeset = Page.changeset(page, %{})
    case PaperTrail.update(changeset, originator: user, meta: %{ snapshot: true }) do
      {:ok, %{ version: version }} -> {:ok, version}
      error -> error
    end
  end

  def delete_revision(user, page_id, id) do
    page = Repo.get_by!(Page, id: page_id, user_id: user.id)
    version = Repo.get_by!(Version, id: id, item_id: page.id, item_type: "Page")
    Repo.delete!(version)
  end

  def create_uploads(files, user) do
    files
    |> Enum.reduce(Multi.new, fn(f, multi) ->
      %{size: size} = File.stat! f.path
      hash = :erlang.md5(f.path |> File.read!) |> Base.encode16(case: :lower)

      case Repo.get_by(Upload, hash: hash) do
        nil ->
          id = Quasar.Repo.next_val("uploads_id_seq")
          multi
          |> Multi.insert(
            f.filename,
            Upload.changeset(%Upload{}, %{
              id:           id,
              user_id:      user.id,
              hash:         hash,
              uploaded_as:  f.filename,
              file:         %{f | filename: generate_file_name(f, id)},
              content_type: f.content_type,
              size:         size,
            })
          )
        upload ->
          multi |> Multi.run(:existing, fn _ -> {:ok, %Upload{ upload | uploaded_as: f.filename }} end)
      end

    end)
    |> Repo.transaction()
  end

  defp delete_stale_page_autosaves(%Page{} = page) do
    q = from v in Version,
      where: v.item_id == ^page.id and v.item_type == "Page" and fragment("(meta->>'snapshot') IS NULL"),
      order_by: [desc: v.inserted_at],
      offset: 100,
      select: v.id
    Repo.delete_all(Version |> where([v], v.id in ^Repo.all(q)))
  end

  defp generate_file_name(f, id) do
    ext  = :filename.extension(f.filename)
    Hashids.encode(@hashids, id) <> ext
  end

end





