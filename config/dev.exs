use Mix.Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with brunch.io to recompile .js and .css sources.
config :quasar, Quasar.Web.Endpoint,
  http: [port: 4000],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [{Path.expand("assets/webpack.dev.js"), [cd: Path.expand("../assets", __DIR__)]}]

# Watch static and templates for browser reloading.
config :quasar, Quasar.Web.Endpoint,
  live_reload: [
    patterns: [
      # ~r{priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$},
      ~r{priv/gettext/.*(po)$},
      ~r{lib/quasar/.*/.*(ex)$}
    ]
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Configure your database
config :quasar, Quasar.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "quasar_dev",
  hostname: "localhost",
  pool_size: 10

# https://github.com/ueberauth/guardian/issues/152
config :guardian, Guardian,
  allowed_algos: ["ES512"],
  verify_module: Guardian.JWT,  # optional
  issuer: "Quasar",
  ttl: { 30, :days },
  allowed_drift: 2000,
  verify_issuer: true, # optional
  secret_key:
  %{"alg" => "ES512",
    "crv" => "P-521",
    "d" => "Abh3MzyVbIXubYBNkkO0YwUXGjvB2ODAE8h7btYSRuxi7iOj1gVPx2WA2PqPdcM586IAalRmIRmoaqxYRBke-4Ak",
    "kty" => "EC",
    "use" => "sig",
    "x" => "Ab4R9w7Mvy1GOMRD-FgOGVvErIhqlc2HtqdDGXMjeyNyidcwxihOWjRr5MboSPzlWZ35ef-64vXFFf0zCGFumZ7x",
    "y" => "AMhpCQPZZ1Ea7MuEVNl70yjGKo1Fd79KXIx2XGK2Ziy8kJNj33OekDmP2sJgtKF0UgwTXUJ_trrefkE9GGpMo-Xg"},
  serializer: Quasar.GuardianSerializer

config :quasar, :environment, :dev

### User Config

config :quasar,
  allow_registration: true

config :arc,
  storage: Arc.Storage.Local

config :quasar, Quasar.Mailer,
  adapter: Bamboo.LocalAdapter,
  from_email: "no-reply@example.com"

config :quasar,
  upload_salt: "0w`oG|aRA(F%uZ]j~_liyfaXG[xbHaE[O}j1_y^(GJ#RZyg]Zy2qVNZ&;?#9e1>["
