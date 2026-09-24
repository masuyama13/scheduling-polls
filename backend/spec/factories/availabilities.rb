# == Schema Information
#
# Table name: availabilities
#
#  id             :bigint           not null, primary key
#  status         :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  response_id    :bigint           not null
#  time_option_id :bigint           not null
#
# Indexes
#
#  index_availabilities_on_response_id                     (response_id)
#  index_availabilities_on_response_id_and_time_option_id  (response_id,time_option_id) UNIQUE
#  index_availabilities_on_time_option_id                  (time_option_id)
#
# Foreign Keys
#
#  fk_rails_...  (response_id => responses.id)
#  fk_rails_...  (time_option_id => time_options.id)
#
FactoryBot.define do
  factory :availability do
    status { :unavailable }

    association :response
    association :time_option
  end
end
