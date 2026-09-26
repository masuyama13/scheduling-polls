# == Schema Information
#
# Table name: availabilities
#
#  id             :bigint           not null, primary key
#  status         :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  response_id    :bigint           not null
#  time_option_id :bigint           not null
#
# Indexes
#
#  index_availabilities_on_response_id                     (response_id)
#  index_availabilities_on_response_id_and_time_option_id  (response_id,time_option_id) UNIQUE
#  index_availabilities_on_time_option_id                  (time_option_id)
#
# Foreign Keys
#
#  fk_rails_...  (response_id => responses.id)
#  fk_rails_...  (time_option_id => time_options.id)
#
class Availability < ApplicationRecord
  belongs_to :response
  belongs_to :time_option

  enum :status, { unavailable: 0, available: 1 }, validate: true

  validates :status, presence: true

  validate :time_option_must_belong_to_same_event

  private

  def time_option_must_belong_to_same_event
    return if response.blank? || time_option.blank?
    return if response.event_id == time_option.event_id

    errors.add(:time_option, "must belong to the same event")
  end
end
