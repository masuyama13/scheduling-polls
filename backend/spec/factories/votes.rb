FactoryBot.define do
  factory :vote do
    available { false }

    association :response
    association :time_option
  end
end
