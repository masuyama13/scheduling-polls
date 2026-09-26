# == Schema Information
#
# Table name: responses
#
#  id         :bigint           not null, primary key
#  comment    :text
#  name       :string           not null
#  time_zone  :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  event_id   :bigint           not null
#
# Indexes
#
#  index_responses_on_event_id  (event_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#
class Response < ApplicationRecord
  belongs_to :event
  has_many :availabilities, dependent: :destroy

  accepts_nested_attributes_for :availabilities, allow_destroy: true

  validates :name, presence: true, length: { maximum: 50 }
  validates :comment, length: { maximum: 100 }, allow_nil: true
  validates :time_zone, presence: true
  validate :time_zone_must_be_valid
  validate :event_response_limit, on: :create
  validate :all_time_options_answered
  validate :availability_time_options_must_be_unique

  private

  def time_zone_must_be_valid
    return if time_zone.blank?

    TZInfo::Timezone.get(time_zone)
  rescue TZInfo::InvalidTimezoneIdentifier
    errors.add(:time_zone, "is invalid")
  end

  def event_response_limit
    return if event.blank? || event.responses.where.not(id: id).count < 20

    errors.add(:base, "An Event can have at most 20 responses")
  end

  def all_time_options_answered
    return if event.blank?

    expected_ids = event.time_options.ids.sort
    submitted_ids = availabilities.reject(&:marked_for_destruction?).filter_map(&:time_option_id).sort
    return if expected_ids == submitted_ids

    errors.add(:availabilities, "must include one answer for every time option")
  end

  def availability_time_options_must_be_unique
    time_option_ids = availabilities.reject(&:marked_for_destruction?).filter_map(&:time_option_id)
    return if time_option_ids.uniq.size == time_option_ids.size

    errors.add(:availabilities, "must not contain duplicate time options")
  end
end
