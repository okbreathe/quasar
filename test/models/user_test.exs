defmodule Quasar.UserTest do
  use Quasar.ModelCase

  alias Quasar.User

  @valid_attrs %{email: "user@example.com", name: "user"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = User.changeset(%User{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = User.changeset(%User{}, @invalid_attrs)
    refute changeset.valid?
  end
end
