class RenameVotesToAvailabilities < ActiveRecord::Migration[8.1]
  def up
    rename_table :votes, :availabilities
    rename_column :availabilities, :available, :status
    change_column :availabilities, :status, :integer, using: "CASE WHEN status THEN 1 ELSE 0 END", null: false
    add_index :availabilities, [ :response_id, :time_option_id ], unique: true
  end

  def down
    remove_index :availabilities, [ :response_id, :time_option_id ]
    change_column :availabilities, :status, :boolean, using: "status <> 0", null: false
    rename_column :availabilities, :status, :available
    rename_table :availabilities, :votes
  end
end
