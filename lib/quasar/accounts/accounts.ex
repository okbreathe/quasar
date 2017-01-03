defmodule Quasar.Accounts do
  @moduledoc """
  The boundary for the Accounts system.
  """

  import Ecto.{Query, Changeset}, warn: false
  import Comeonin.Bcrypt, only: [checkpw: 2, dummy_checkpw: 0]

  alias Quasar.Repo
  alias Quasar.Accounts.User

  def list_users, do: Repo.all(User)

  def get_user!(id), do: Repo.get!(User, id)

  def find_by_email(email), do: Repo.get_by(User, email: email)

  def find_by_token(token) do
    case token do
      nil -> nil
      token ->
        time = Timex.now |> Timex.shift(days: -1)
        Repo.one(from u in User, where: u.reset_token == ^token and u.reset_token_at >= ^time)
    end
  end

  @spec find_and_confirm_password(Map) :: Map
  def find_and_confirm_password(%{ "email" => email, "password" => password }) do
    user = Repo.get_by(User, email: email)
    cond do
      user && checkpw(password, user.password_hash) ->
        {:ok, user}
      user ->
        {:error, :unauthorized}
      true ->
         # simulate check password hash timing
        dummy_checkpw()
        {:error, :not_found}
    end
  end

  def reset_user_password(token, attrs \\ %{} ) do
    find_by_token(token)
    |> User.changeset(Map.merge(attrs, %{ "reset_token" => "", "reset_token_at" => nil }))
    |> Repo.update()
  end

  def create_reset_token(email) do
    case find_by_email(email) do
      nil ->
        {:error, :user_not_found}
      user ->
        user
        |> User.reset_password_changeset()
        |> Repo.update()
    end
  end

  def new_user, do: User.changeset(%User{})

  def create_user(attrs \\ %{}) do
    %User{}
    |> User.create_changeset(attrs)
    |> Repo.insert()
  end

  def generate(name, email, password), do: User.generate(name, email, password)

  def edit_user(user), do: User.changeset(user)

  def update_user(id, attrs) do
    get_user!(id)
    |> User.changeset(attrs)
    |> Repo.update()
  end

  def delete_user(id), do: Repo.get!(User, id) |> Repo.delete!()
end
