# Quasar

Quasar is a [React](https://facebook.github.io/react/) powered Markdown wiki consuming a [Phoenix](http://www.phoenixframework.org/)-based API.

## Features

* Markdown editor via [Ace](https://ace.c9.io/)
* Drag and Drop File Upload
* Autosaving and Snapshots
* Themeing and Typography Control
* Tagging and Filtering
* Vim and Emacs Emulation Modes

**IE is not supported.**

## Tour

#### Creating Pages

You can create a new page by pressing the `+` icon next to the search box. Pages can have one or more tags. When you create a page it will be automatically tagged with the tag that is currently selected. If no tag is selected the page can be found under "All Notes" until it is tagged.

#### Revisions

Quasar will autosave every three minutes. If you have unsaved changes the sync icon in the upper-right corner will be red. To save immediately either press the icon or use the `control + s` shortcut. Autosaves will be deleted after 100 saves starting with the oldest. If you would like to have a permanent snapshot of a page you can use the revision menu to the left of the save icon to create an explicit snapshot that will never be deleted.

#### Customization

You can customize your experience via the settings menu which can be accessed from the menu icon in the upper left. In the lower right-hand corner you can favorite, trash a page or change the view (editor-only, preview-only or split screen).

That's it!

## Installation

* Make sure you have the dependencies installed ( Postgres 9.2+, NodeJS, [Yarn](https://yarnpkg.com/en/), [Elixir](elixir-lang.org) )
* Inside the project, install Elixir dependencies with `mix deps.get`
* Install JavaScript dependencies with `yarn install`
* Create your database with `mix ecto.create`
* Migrate your database with `mix ecto.migrate` or seed the database with test data via `mix ecto.setup`
* Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

### Configuration

For changes in development mode, you can edit `config/dev.exs`. In production you can configure Quasar by creating a `config/prod.secret.exs` file. Copy `config/prod.secret.exs.example` to `config/prod.secret.exs` and edit in your details.

```elixir
# If true users can create new accounts through the web interface
config :quasar,
  allow_registration: false

# Store files on disk
config :arc,
  storage: Arc.Storage.Local

# Or use AWS for storage
config :arc,
  storage: Arc.Storage.S3,
  bucket: "your-bucket"

config :ex_aws,
  access_key_id: [{:system, "AWS_ACCESS_KEY_ID"}, :instance_role],
  secret_access_key: [{:system, "AWS_SECRET_ACCESS_KEY"}, :instance_role]

# Sending Email
# Only used for sending out forgotten password emails
# For other adapters see [Bamboo](https://github.com/thoughtbot/bamboo)'s docs
config :quasar, Quasar.Mailer,
  adapter: Bamboo.MandrillAdapter,
  api_key: "my_api_key"

# Used to generate short filenames for uploads
config :quasar,
  upload_salt: "put your unique phrase here"
```

## In Production

Production releases can be handled by [distillery](https://github.com/bitwalker/distillery). To create a production release:

```bash
# Get dependencies
mix deps.get
# Compile assets
mix phx.digest
# Edit your production configuration
cp config/prod.secret.exs.example config/prod.secret.exs
# Build release. Note that PORT and HOST are optional and will default to the specified values
MIX_ENV=prod PORT=4000 HOST=localhost mix release --env=prod
# Much compiling later
==> Release successfully built!
    You can run it in one of the following ways:
      Interactive: _build/prod/rel/quasar/bin/quasar console
      Foreground: _build/prod/rel/quasar/bin/quasar foreground
      Daemon: _build/prod/rel/quasar/bin/quasar start
# Start the app
./_build/prod/rel/quasar/bin/quasar start
```

Since you won't have access to mix in production, you can create a new user by connecting a console to the running release.

```bash
./_build/prod/rel/quasar/bin/quasar remote_console
```

Now run the user generation command in IEx.

```elixir
iex(1)> Quasar.Accounts.generate("user", "user@email.com", "password")
```

### Deployment

Quasar can be deployed using  [edeliver](https://github.com/boldpoker/edeliver). To get started copy the `.deliver/config.example` to `.deliver/config` and edit in your configuration. The host will also require [Yarn](https://yarnpkg.com/) and [Elixir](http://elixir-lang.org/) to be available.

For other options please [check the deployment](http://www.phoenixframework.org/docs/deployment) and [advanced deployment](http://www.phoenixframework.org/docs/advanced-deployment) guides. It is recommended to run Quasar behind a proxy like `nginx`. See the [guide](http://www.phoenixframework.org/docs/serving-your-application-behind-a-proxy) for more details.
