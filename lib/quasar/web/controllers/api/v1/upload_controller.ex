defmodule Quasar.Web.Api.V1.UploadController do
  use Quasar.Web, :authenticated_controller
  alias Quasar.Wiki

  plug :scrub_params, "upload" when action in [:create]
  action_fallback Quasar.Web.Api.V1.FallbackController

  def create(conn, %{"upload" => %{"file" => files}}, current_user, _claims) do
    with {:ok, inserted} <- Wiki.create_uploads(current_user, files) do
      conn
      |> put_status(:created)
      |> render("show.json", data: %{ files: Map.values(inserted) })
    end
  end
end
