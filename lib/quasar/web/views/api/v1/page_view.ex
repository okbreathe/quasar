defmodule Quasar.Web.Api.V1.PageView do
  use Quasar.Web, :view

  attributes [
    :title,
    :content,
    :is_favorite,
    :is_trashed,
    :tag_list,
    :inserted_at,
    :updated_at
  ]

  has_many :tags, serializer: Quasar.Web.Api.V1.TagView, include: true

  def tag_list(page, _conn) do
    page.tags |> Enum.map(fn(t) -> t.name end) |> Enum.join(",")
  end
end
