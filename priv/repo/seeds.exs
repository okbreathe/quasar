alias Quasar.Repo
alias Quasar.Accounts.User
alias Quasar.Wiki.{Page, Tag}

content = File.cwd!
          |> Path.join("priv/repo/spec.txt")
          |> File.read!

user = Repo.insert!(
  User.create_changeset(
    %User{},
    %{ "name" => "admin", "email" => "user@example.com", "password_confirmation" => "password", "password" => "password" }
  )
)

id = user.id

tags = [
  %{ name: "Personal" },
  %{ name: "Business" },
  %{ name: "Todo" },
  %{ name: "Learning"} ,
]

for tag <- tags do
  Repo.insert!(Tag.changeset(%Tag{}, tag))
end

for i <- (1..20) do
  page = %{ "title" => "Page #{i}", "content" => content, "user_id" => id, "tags" => Enum.random(tags).name }
  PaperTrail.insert(Page.changeset(%Page{}, page))
end
