defmodule Quasar.Mixfile do
  use Mix.Project

  def project do
    [app: :quasar,
     version: "0.9.0",
     elixir: "~> 1.2",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     start_permanent: Mix.env == :prod,
     aliases: aliases(),
     deps: deps()]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {Quasar.Application, []},
     applications: [
       :arc,
       :arc_ecto,
       :bamboo,
       :bamboo_smtp,
       :ex_aws,
       :comeonin,
       :cowboy,
       :gettext,
       :guardian,
       :hackney,
       :ja_serializer,
       :logger,
       :paper_trail,
       :phoenix,
       :phoenix_ecto,
       :phoenix_html,
       :phoenix_pubsub,
       :poison,
       :postgrex,
       :timex,
       :timex_ecto,
       # Must be at the end
       :edeliver,
     ]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:arc_ecto, "~> 0.6.0"},
      {:bamboo, "~> 0.8"},
      {:bamboo_smtp, "~> 1.3.0"},
      {:comeonin, "~> 3.0"},
      {:cowboy, "~> 1.0"},
      {:distillery, "~> 1.0"},
      {:ecto, "~> 2.1.1"},
      {:edeliver, "~> 1.4.0"},
      {:ex_aws, "~> 1.0"},
      {:faker, "~> 0.5", only: [ :dev, :test ]},
      {:gettext, "~> 0.11"},
      {:guardian, "~> 0.14"},
      {:hackney, "~> 1.6.5", override: true},
      {:hashids, "~> 2.0"},
      {:ja_serializer, "~> 0.11.2"},
      {:paper_trail, "~> 0.7.3"},
      {:phoenix, "~> 1.3.0-rc", override: true},
      {:phoenix_ecto, "~> 3.2"},
      {:phoenix_html, "~> 2.6"},
      {:phoenix_live_reload, "~> 1.0", only: :dev},
      {:phoenix_pubsub, "~> 1.0"},
      {:poison, "~> 3.0", override: true},
      {:postgrex, ">= 0.0.0"},
      {:secure_random, "~> 0.5"},
      {:sweet_xml, "~> 0.6"},
      {:timex, "~> 3.0"},
      {:timex_ecto, "~> 3.0"},
   ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    ["ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
     "ecto.reset": ["ecto.drop", "ecto.setup"],
     "phx.digest": "quasar.digest",
     "test": ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
end
