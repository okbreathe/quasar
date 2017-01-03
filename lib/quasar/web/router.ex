defmodule Quasar.Web.Router do
  use Quasar.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :json_api do
    plug :accepts, ["json-api"]
    plug JaSerializer.ContentTypeNegotiation
    plug JaSerializer.Deserializer
  end

  pipeline :file_api do
    plug :accepts, ["json"]
  end

  pipeline :with_user do
    plug Guardian.Plug.VerifySession
    plug Guardian.Plug.LoadResource
    plug Quasar.Web.Plug.CurrentUser
  end

  pipeline :protected_browser do
    plug Guardian.Plug.VerifySession
    plug Guardian.Plug.LoadResource
    plug Guardian.Plug.EnsureAuthenticated, handler: Quasar.Web.SessionController
    plug Quasar.Web.Plug.CurrentUser
  end

  pipeline :protected_api do
    plug Guardian.Plug.VerifyHeader
    plug Guardian.Plug.LoadResource
    plug Guardian.Plug.EnsureAuthenticated, handler: Quasar.Web.SessionController
    plug Quasar.Web.Plug.CurrentUser
  end

  scope "/", Quasar.Web do
    pipe_through [ :browser, :with_user ]

    get "/", SiteController, :index
    post "/sessions", SessionController, :create
    delete "/sessions", SessionController, :delete
    resources "/passwords", PasswordController, except: [:index, :show, :delete], singleton: true
    resources "/registrations", RegistrationController, only: [:new, :create]
  end

  scope "/", Quasar.Web do
    pipe_through(if Application.get_env(:quasar, :transient_storage), do: [:browser], else: [ :browser, :protected_browser ])
    get "/app/*anything", SiteController, :app
  end

  scope "/api", Quasar.Web.Api.V1 do
    pipe_through [ :file_api, :protected_api ]
    resources "/uploads", UploadController, only: [:create]
  end

  scope "/api", Quasar.Web.Api.V1 do
    pipe_through [ :json_api, :protected_api ]

    post "/sessions", SessionController, :create
    delete "/sessions", SessionController, :delete
    get "/search", SearchController, :index
    resources "/pages", PageController, except: [:new, :edit] do
      resources "/revisions", RevisionController, only: [:index, :create, :delete]
    end
    resources "/users", UserController, only: [:update, :delete], singleton: true
  end
end
