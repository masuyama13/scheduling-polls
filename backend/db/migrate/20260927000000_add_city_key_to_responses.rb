class AddCityKeyToResponses < ActiveRecord::Migration[8.1]
  def change
    add_column :responses, :city_key, :string
  end
end
