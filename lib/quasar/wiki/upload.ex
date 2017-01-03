defmodule Quasar.Wiki.Upload do
  use Quasar.Web, :model
  use Arc.Ecto.Schema

  schema "uploads" do
    field :content_type, :string, null: false
    field :size, :integer, null: false
    field :hash, :string, null: false
    field :file, Quasar.FileUpload.Type
    field :uploaded_as, :string, virtual: true
    belongs_to :user, Quasar.Accounts.User

    timestamps()
  end

  @required_fields ~w(content_type size hash user_id)
  @optional_fields ~w(uploaded_as)
  @required_file_fields ~w(file)

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
    |> cast_attachments(params, @required_file_fields)
    |> validate_required([:file, :content_type, :size, :user_id])
  end
end
