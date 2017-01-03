defmodule Quasar.Accounts.User do
  use Quasar.Web, :model
  alias Quasar.Repo
  alias Quasar.Accounts.User

  schema "users" do
    field :email, :string
    field :name, :string
    field :password, :string, virtual: true
    field :password_confirmation, :string, virtual: true
    field :password_hash, :string
    field :reset_token, :string
    field :reset_token_at, :utc_datetime
    field :settings, :map, default: %{}

    has_many :uploads, Quasar.Wiki.Upload
    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(merge_settings(struct, params), [:email, :name, :settings, :password, :password_confirmation])
    |> validate_format(:email, ~r/@/)
    |> validate_length(:password, min: 5, max: 40)
    |> validate_confirmation(:password)
    |> validate_required([:email, :name])
    |> unique_constraint(:email)
    |> hash_password
  end

  def create_changeset(struct, params) do
    struct
    |> changeset(params)
    |> put_change(:settings, initial_settings())
    |> validate_required([:password, :password_confirmation])
  end

  def reset_password_changeset(struct) do
    struct
    |> cast(%{ reset_token: generate_token(), reset_token_at: Timex.now }, [:reset_token, :reset_token_at])
  end

  def generate(name, email, password) do
    create_changeset(%User{}, %{ "name" => name, "email" => email, "password" => password, "password_confirmation" => password })
    |> Repo.insert()
  end

  def initial_settings do
    %{
      "sort"                                  => "updated_at.desc",
      "tab_size"                              => 2,
      "theme"                                 => "monokai",
      "editor.font_family"                    => "Ubuntu Mono",
      "editor.font_size"                      => 12,
      "editor.line_height"                    => 1.2,
      "preview.font_family"                   => "Ubuntu",
      "preview.font_size"                     => 14,
      "preview.margin_bottom.p,ul,blockquote" => 1,
      "preview.line_height"                   => 1.5,
      "preview.padding"                       => 8,
    }
  end

  @spec hash_password(Map) :: Map
  defp hash_password(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: password}} ->
        put_change(changeset, :password_hash, Comeonin.Bcrypt.hashpwsalt(password))
      _ ->
        changeset
    end
  end

  @spec merge_settings(Map, Map) :: Map
  defp merge_settings(user, params) do
    {_, merged} = Map.get_and_update(params, "settings", fn val ->
      case val do
        nil -> {val, user.settings}
        map -> {val, Map.merge(user.settings, map)}
      end
    end)
    merged
  end

  defp generate_token() do
    SecureRandom.urlsafe_base64(64)
  end

end
