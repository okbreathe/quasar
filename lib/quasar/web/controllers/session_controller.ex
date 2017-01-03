defmodule Quasar.Web.SessionController do
  use Quasar.Web, :controller

  alias Quasar.Accounts

  plug :scrub_params, "user" when action in [:create]

  def create(conn, %{ "user" => user_params }) do
    case Accounts.find_and_confirm_password(user_params) do
      {:ok, user} ->
        conn
        |> Guardian.Plug.sign_in(user)
        |> redirect(to: "/app")
      {:error, _reason} ->
        conn
        |> put_flash(:error, "Invalid email/password combination")
        |> redirect(to: "/")
    end
  end

  def delete(conn, _params) do
    conn
    |> Guardian.Plug.sign_out
    |> put_flash(:info, "Logged out")
    |> redirect(to: "/")
  end

  def unauthenticated(conn, _params) do
    conn
    |> put_status(401)
    |> send_resp(:no_content, "")
  end
end
