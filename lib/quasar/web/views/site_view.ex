defmodule Quasar.Web.SiteView do
  use Quasar.Web, :view

  alias Quasar.Accounts.User

  def user_json(conn) do
    user = if Application.get_env(:quasar, :transient_storage),
      do: %{ settings: User.initial_settings() },
      else: Map.take(conn.assigns.current_user, [:id, :settings, :name, :email])
    Quasar.Web.Api.V1.UserView
    |> JaSerializer.format(user, conn)
    |> Poison.encode!
  end
end
