defmodule Quasar.PageControllerTest do
  use Quasar.ConnCase

  alias Quasar.Page
  @valid_attrs %{}
  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, page_path(conn, :index)
    assert json_response(conn, 200)["data"] == []
  end

  test "shows chosen resource", %{conn: conn} do
    page = Repo.insert! %Page{}
    conn = get conn, page_path(conn, :show, page)
    assert json_response(conn, 200)["data"] == %{"id" => page.id}
  end

  test "renders page not found when id is nonexistent", %{conn: conn} do
    assert_error_sent 404, fn ->
      get conn, page_path(conn, :show, -1)
    end
  end

  test "creates and renders resource when data is valid", %{conn: conn} do
    conn = post conn, page_path(conn, :create), page: @valid_attrs
    assert json_response(conn, 201)["data"]["id"]
    assert Repo.get_by(Page, @valid_attrs)
  end

  test "does not create resource and renders errors when data is invalid", %{conn: conn} do
    conn = post conn, page_path(conn, :create), page: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "updates and renders chosen resource when data is valid", %{conn: conn} do
    page = Repo.insert! %Page{}
    conn = put conn, page_path(conn, :update, page), page: @valid_attrs
    assert json_response(conn, 200)["data"]["id"]
    assert Repo.get_by(Page, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn} do
    page = Repo.insert! %Page{}
    conn = put conn, page_path(conn, :update, page), page: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  test "deletes chosen resource", %{conn: conn} do
    page = Repo.insert! %Page{}
    conn = delete conn, page_path(conn, :delete, page)
    assert response(conn, 204)
    refute Repo.get(Page, page.id)
  end
end
