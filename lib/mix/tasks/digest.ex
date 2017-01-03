defmodule Mix.Tasks.Quasar.Digest do
  use Mix.Task

  def run(args) do
    Mix.Shell.IO.cmd "cd assets && NODE_ENV=production ./node_modules/webpack/bin/webpack.js -p"
    :ok = Mix.Tasks.Phx.Digest.run(args)
  end
end
