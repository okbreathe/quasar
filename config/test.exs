use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :quasar, Quasar.Web.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :quasar, Quasar.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "quasar_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

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

config :quasar, :environment, :test

### User Config

config :quasar,
  allow_registration: true

config :quasar,
  transient_storage: false

config :arc,
  storage: Arc.Storage.Local

config :quasar, Quasar.Web.Mailer,
  adapter: Bamboo.TestAdapter

config :quasar,
  upload_salt: "0w`oG|aRA(F%uZ]j~_liyfaXG[xbHaE[O}j1_y^(GJ#RZyg]Zy2qVNZ&;?#9e1>["
