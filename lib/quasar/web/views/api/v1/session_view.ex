defmodule Quasar.Web.Api.V1.SessionView do
  use Quasar.Web, :view

  def render("show.json", %{token: token, user: user}) do
    %{ token: token, user: user }
  end

  def render("error.json", _) do
    %{error: "Invalid email or password"}
  end

  def render("delete.json", _) do
    %{ok: true}
  end

  def render("forbidden.json", %{error: error}) do
    %{error: error}
  end
end

