defmodule Quasar.Web.RegistrationController do
  use Quasar.Web, :controller

  alias Quasar.Accounts

  plug :scrub_params, "user" when action in [:create]
  plug :registration_allowed

  def new(conn, _params) do
    render(conn, "new.html", changeset: Accounts.new_user())
  end

  def create(conn, %{"user" => user_params}) do
    case Accounts.create_user(user_params) do
      {:ok, _user} ->
        conn
        |> put_flash(:info, "Account created successfully.")
        |> redirect(to: "/")
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  defp registration_allowed(conn, _params) do
    unless Application.get_env(:quasar, :allow_registration), do: conn |> redirect(to: "/") |> halt, else: conn
  end
end
