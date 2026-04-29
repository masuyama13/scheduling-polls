class Event < ApplicationRecord
  has_many :time_options, dependent: :destroy
  has_many :responses, dependent: :destroy
end
