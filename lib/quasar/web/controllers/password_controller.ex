defmodule Quasar.Web.PasswordController do
  use Quasar.Web, :controller

  alias Quasar.{Accounts, Mailer}
  alias Quasar.Web.{Emails}

  def new(conn, _params) do
    render conn, "new.html"
  end

  def create(conn, %{"user" => %{"email" => email}}) do
    case Accounts.create_reset_token(email) do
      {:ok, user} ->
        Emails.reset_password_email(conn, user) |> Mailer.deliver_now
        render conn, "new.html"
      {:error, :user_not_found}
        conn
        |> put_flash(:error, "Can't find that email, sorry.")
        |> redirect(to: password_path(conn, :new))
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render("edit.html", errors: changeset)
    end
  end

  def edit(conn, params \\ %{}) do
    case Accounts.find_by_token(params["token"]) do
      nil ->
        conn
        |> put_flash(:error, "It looks like you clicked on an invalid password reset link. Please try again.")
        |> redirect(to: password_path(conn, :new))
      user -> render(conn, "edit.html", user: user, changeset: Accounts.edit_user(user))
    end
  end

  def update(conn, %{"token" => token, "user" => user_params}) do
    case Accounts.reset_user_password(token, user_params) do
      {:ok, _user} ->
        conn
        |> put_flash(:ok, "Password Reset")
        |> redirect(to: "/")
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render("edit.html", errors: changeset)
    end
  end
end
