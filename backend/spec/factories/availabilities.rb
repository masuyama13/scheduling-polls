FactoryBot.define do
  factory :availability do
    status { :unavailable }

    association :response
    association :time_option
  end
end
