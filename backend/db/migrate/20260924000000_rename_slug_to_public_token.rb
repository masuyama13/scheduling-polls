class RenameSlugToPublicToken < ActiveRecord::Migration[8.1]
  def change
    rename_column :events, :slug, :public_token
  end
end
