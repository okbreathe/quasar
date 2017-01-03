defmodule Quasar.Web.Api.V1.UserView do
  use Quasar.Web, :view

  attributes [
    :email,
    :name,
    :settings,
    :inserted_at,
    :updated_at
  ]
end
