# == Schema Information
#
# Table name: events
#
#  id          :bigint           not null, primary key
#  description :text
#  name        :string           not null
#  slug        :string           not null
#  time_zone   :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_events_on_slug  (slug) UNIQUE
#
class Event < ApplicationRecord
  before_create :generate_slug

  has_many :time_options, dependent: :destroy
  has_many :responses, dependent: :destroy

  accepts_nested_attributes_for :time_options, allow_destroy: true

  private
  def generate_slug
    if self.slug.blank?
      self.slug = SecureRandom.urlsafe_base64
    end
  end
end
