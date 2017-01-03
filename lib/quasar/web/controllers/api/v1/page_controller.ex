defmodule Quasar.Web.Api.V1.PageController do
  use Quasar.Web, :authenticated_controller
  alias Quasar.Wiki

  action_fallback Quasar.Web.Api.V1.FallbackController

  def index(conn, _params, current_user, _claims) do
    render(conn, "index.json", data: Wiki.list_pages(current_user))
  end

  def create(conn, %{"page" => page_params}, current_user, _claims) do
    with {:ok, page} <- Wiki.create_page(current_user, page_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", page_path(conn, :show, page))
      |> render("show.json", data: page |> Repo.preload([:tags]))
    end
  end

  def show(conn, %{"id" => id}, current_user, _claims) do
    render(conn, "show.json", data: Wiki.get_page!(current_user, id))
  end

  def update(conn, %{"id" => id, "page" => page_params}, current_user, _claims) do
    with {:ok, page} <- Wiki.update_page(current_user, id, page_params) do
      render(conn, "show.json", data: page |> Repo.preload([:tags]))
    end
  end

  def delete(conn, %{"id" => id}, current_user, _claims) do
    Wiki.delete_page(current_user, id)
    send_resp(conn, :no_content, "")
  end
end
