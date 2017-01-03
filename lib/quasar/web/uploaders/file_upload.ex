defmodule Quasar.FileUpload do
  use Arc.Definition
  use Arc.Ecto.Definition
  use Timex

  @versions [:original]

  def storage_dir(_version, {_file, scope}) do
    "uploads/#{scope.hash |> String.slice(0,2)}"
  end

end
