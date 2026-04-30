FactoryBot.define do
  factory :event do
    name { "Event Name" }
    description { "This is event description." }
    time_zone { "America/Vancouver" }
  end
end
