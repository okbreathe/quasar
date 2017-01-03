defmodule Quasar.Web.Emails do
  import Bamboo.Email
  use Quasar.Web, :view

  def reset_password_email(conn, user) do
    body = """
    We heard that you lost your Quasar password. Sorry about that!

    But don't worry! You can use the following link within the next day to reset your password:

    #{password_path(conn, :edit, token: user.reset_token)}

    If you don’t use this link within 24 hours, it will expire.
    """
    base_email()
    |> to(user.email)
    |> subject("[Quasar] Please reset your password")
    |> text_body(body)
  end

  defp base_email do
    new_email()
    |> from("no-reply@example.com")
  end
end
