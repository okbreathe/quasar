defmodule Quasar.Web.Api.V1.RevisionController do
  use Quasar.Web, :authenticated_controller
  alias Quasar.Wiki

  action_fallback Quasar.Web.Api.V1.FallbackController

  def index(conn, %{"page_id" => id}, current_user, _claims) do
    render(conn, "index.json", data: Wiki.list_revisions(current_user,id))
  end

  def create(conn, %{"page_id" => page_id}, current_user, _claims) do
    with {:ok, version } <- Wiki.create_revision(current_user, page_id) do
      render(conn, "show.json", data: version)
    end
  end

  def delete(conn, %{"page_id" => page_id, "id" => id}, current_user, _claims) do
    Wiki.delete_revision(current_user, page_id, id)
    send_resp(conn, :no_content, "")
  end
end
