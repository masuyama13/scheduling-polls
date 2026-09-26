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
FactoryBot.define do
  factory :response do
    name { "John" }
    comment { "This is a comment." }
    time_zone { "America/Vancouver" }

    association :event

    after(:build) do |response|
      time_options = response.event.persisted? ? response.event.time_options.reload : response.event.time_options
      time_options.each do |time_option|
        response.availabilities << build(:availability, response: response, time_option: time_option)
      end
    end
  end
end
