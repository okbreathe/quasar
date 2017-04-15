defmodule Mix.Tasks.Quasar.Static do
  use Mix.Task
  use Mix.Config
  use Phoenix.ConnTest

  alias Quasar.Accounts.User
  alias Quasar.Web.{Endpoint, LayoutView, SiteView}

  import String
  import Enum

  @shortdoc "Create a stand-alone front-end only version of Quasar"
  def run(args) do
    {options, _, _} = OptionParser.parse(args, switches: [public_path: :string, basename: :string, app_root: :string])
    args = options |> Enum.map(fn({k,_}) -> k end)
    flags = (for k <- args, into: [], do: if v = Keyword.get(options, k), do: "#{k |> Atom.to_string |> upcase}=#{v}")
            |> filter(&is_binary/1) |> join(" ")

    Mix.Shell.IO.info "Generating Static Assets"
    Mix.Shell.IO.cmd "rm -rf ./_build/static/"
    Mix.Shell.IO.cmd "mkdir -p ./_build/static/"
    Mix.Shell.IO.cmd "cd assets && TRANSIENT=true #{flags} NODE_ENV=production ./node_modules/webpack/bin/webpack.js -p"
    Mix.Shell.IO.cmd "cp -r ./priv/static/* ./_build/static/"

    Application.ensure_all_started(:quasar)
    Application.put_env(:quasar, :transient, true)
    Application.put_env(:quasar, :environment, :prod)

    conn = build_conn()
           |> assign(:current_user, %User{})
           |> put_private(:phoenix_endpoint, Endpoint)
    html = Phoenix.View.render_to_string(SiteView, "app.html", conn: conn, layout: {LayoutView, "app.html"})

    File.open!("./_build/static/index.html", [:write])
    |> IO.binwrite(html)
    |> File.close

    Mix.Shell.IO.info "Static site can be found under _build/static"
  end
end
