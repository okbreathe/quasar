defmodule Quasar.Web.Api.V1.RevisionView do
  use Quasar.Web, :view

  attributes [
    :event,
    :inserted_at,
    :content,
    :title,
    :item_changes,
    :item_id,
    :item_type,
    :snapshot,
    :meta
  ]

  def title(revision, _conn) do
    revision.item_changes["title"] || ""
  end

  def content(revision, _conn) do
    revision.item_changes["content"] || ""
  end

  def snapshot(revision, _conn) do
    revision.meta["snapshot"] || revision.meta[:snapshot] || false
  end
end
