defmodule Quasar.Web.LayoutView do
  use Quasar.Web, :view

  def transient_storage, do: System.get_env("TRANSIENT") || Application.get_env(:quasar, :transient)

  def dev_mode, do: Application.get_env(:quasar, :environment) == :dev

  def prod_mode, do: Application.get_env(:quasar, :environment) == :prod
end
