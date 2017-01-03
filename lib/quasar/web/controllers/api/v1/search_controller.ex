defmodule Quasar.Web.Api.V1.SearchController do
  use Quasar.Web, :authenticated_controller

  alias Quasar.Wiki

  action_fallback Quasar.Web.Api.V1.FallbackController

  def index(conn, %{"query" => query}, current_user, _claims) do
    render(conn, "index.json", data: Wiki.search_pages(current_user, query))
  end
end
