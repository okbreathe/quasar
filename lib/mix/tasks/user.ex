defmodule Mix.Tasks.Quasar.User do
  use Mix.Task
  use Mix.Config
  import Mix.Ecto
  alias Quasar.Accounts.User

  @shortdoc "Create a New User"
  def run(args) do
    {options, _, _} = OptionParser.parse(args, switches: [name: :string, email: :string, password: :string])
    name            = Keyword.get(options, :name)
    email           = Keyword.get(options, :email)
    password        = Keyword.get(options, :password)

    [:timex] |> Enum.each(&Application.ensure_all_started/1)
    ensure_started(Quasar.Repo, [])

    if name && email && password do
      case User.generate(name, email, password) do
        {:ok, user} ->
          Mix.shell.info  "User #{name} (id: #{user.id}) created"
        {:error, changeset} ->
          Mix.shell.info inspect(changeset.errors)
      end
    else
      Mix.shell.info "Name, email and password are required"
    end
  end
end
