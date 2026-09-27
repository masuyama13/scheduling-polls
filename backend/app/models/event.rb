# == Schema Information
#
# Table name: events
#
#  id           :bigint           not null, primary key
#  description  :text
#  name         :string           not null
#  public_token :string           not null
#  time_zone    :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_events_on_public_token  (public_token) UNIQUE
#
class Event < ApplicationRecord
  MAX_PASSWORD_LENGTH = 48

  has_secure_password validations: false

  before_create :generate_public_token

  has_many :time_options, dependent: :destroy
  has_many :responses, dependent: :destroy

  accepts_nested_attributes_for :time_options, allow_destroy: true

  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 400 }, allow_nil: true
  validates :time_zone, presence: true
  validate :time_zone_must_be_valid
  validate :time_options_count
  validate :time_options_must_be_unique
  validate :password_must_be_valid

  private

  def generate_public_token
    return if public_token.present?

    loop do
      self.public_token = SecureRandom.urlsafe_base64(32)
      break unless self.class.exists?(public_token: public_token)
    end
  end

  def time_zone_must_be_valid
    return if time_zone.blank?

    TZInfo::Timezone.get(time_zone)
  rescue TZInfo::InvalidTimezoneIdentifier
    errors.add(:time_zone, "is invalid")
  end

  def time_options_count
    count = time_options.reject(&:marked_for_destruction?).size
    return if count.between?(1, 10)

    errors.add(:time_options, "must contain between 1 and 10 options")
  end

  def time_options_must_be_unique
    starts_at_values = time_options.reject(&:marked_for_destruction?).filter_map(&:starts_at)
    return if starts_at_values.uniq.size == starts_at_values.size

    errors.add(:time_options, "must not contain duplicate options")
  end

  def password_must_be_valid
    return if password.nil? || password.empty?

    errors.add(:password, "must be at least 4 characters") if password.length < 4
    errors.add(:password, "must be at most #{MAX_PASSWORD_LENGTH} characters") if password.length > MAX_PASSWORD_LENGTH
    errors.add(:password, "must not contain whitespace or control characters") unless password.match?(/\A[[:graph:]]+\z/)
  end
end
