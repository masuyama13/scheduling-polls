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
FactoryBot.define do
  factory :event do
    name { "Event Name" }
    description { "This is event description." }
    time_zone { "America/Vancouver" }

    transient do
      with_time_option { true }
    end

    after(:build) do |event, evaluator|
      if evaluator.with_time_option && event.time_options.empty?
        event.time_options << build(:time_option, event: event)
      end
    end
  end
end
