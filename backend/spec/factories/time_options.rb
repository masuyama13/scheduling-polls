FactoryBot.define do
  factory :time_option do
    starts_at { Time.current + 7.day }

    association :event
  end
end
