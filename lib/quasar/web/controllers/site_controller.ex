defmodule Quasar.Web.SiteController do
  use Quasar.Web, :authenticated_controller

  def index(conn, _params, current_user, _claims) do
    transient = Application.get_env(:quasar, :transient_storage)
    if current_user || transient, do: redirect(conn, to: "/app"), else: render(conn, "index.html")
  end

  def app(conn, _params, _current_user, _claims) do
    render conn, "app.html"
  end
end
