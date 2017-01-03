defmodule Quasar.Web.Api.V1.UserController do
  use Quasar.Web, :authenticated_controller
  alias Quasar.Accounts

  action_fallback Quasar.Web.Api.V1.FallbackController

  def update(conn, %{"user" => user_params}, current_user, _claims) do
    with {:ok, user} <- Accounts.update_user(current_user.id, user_params), do: render(conn, "show.json", data: user)
  end

  def delete(conn, current_user, _claims) do
    Accounts.delete_user(current_user.id)
    send_resp(conn, :no_content, "")
  end
end
