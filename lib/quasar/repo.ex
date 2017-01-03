defmodule Quasar.Repo do
  use Ecto.Repo, otp_app: :quasar

 def next_val(serial) do
   %{rows: [[id]|_]} = Ecto.Adapters.SQL.query!(__MODULE__, "SELECT nextval('#{serial}')")
   id
  end
end
