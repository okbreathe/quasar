defmodule Quasar.Web.Api.V1.SessionController do
  use Quasar.Web, :controller
  alias Quasar.Accounts

  plug :scrub_params, "user" when action in [:create]
  action_fallback Quasar.Web.Api.V1.FallbackController

  def create(conn, %{ "user" => user_params }) do
    with {:ok, user} <- Accounts.find_and_confirm_password(user_params) do
      token = Guardian.Plug.current_token(conn)
      conn
      |> Guardian.Plug.sign_in(user)
      |> render("show.json", token: token, user: user)
    end
  end

  def delete(conn, _) do
    {:ok, claims} = Guardian.Plug.claims(conn)

    conn
    |> Guardian.Plug.current_token
    |> Guardian.revoke!(claims)

    render(conn, "delete.json")
  end

  def unauthenticated(conn, _params) do
    conn
    |> put_status(:forbidden)
    |> render(Quasar.Api.V1.SessionView, "forbidden.json", error: "Not Authenticated")
  end
end
