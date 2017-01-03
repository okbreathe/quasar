defmodule Quasar.Web.Api.V1.FileView do
  use Quasar.Web, :view

  attributes [
    :uploaded_as,
    :content_type,
    :size,
    :file,
    :urls,
  ]

  def urls(upload, _conn) do
    for {k,v} <- Quasar.FileUpload.urls({upload.file, upload}), do: {k, v |> String.split("?") |> List.first }, into: %{}
  end

end
