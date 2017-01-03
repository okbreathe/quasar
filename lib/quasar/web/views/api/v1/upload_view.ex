defmodule Quasar.Web.Api.V1.UploadView do
  use Quasar.Web, :view

  has_many :files, serializer: Quasar.Web.Api.V1.FileView, include: true
end
