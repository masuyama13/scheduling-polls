FactoryBot.define do
  factory :response do
    name { "John" }
    comment { "This is a comment." }
    time_zone { "America/Vancouver" }

    association :event
  end
end
