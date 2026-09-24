require "rails_helper"

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
RSpec.describe Availability, type: :model do
  describe "time option event consistency" do
    let(:event1) { create(:event) }
    let(:event2) { create(:event) }
    let(:time_option_event1) { create(:time_option, event: event1) }
    let(:time_option_event2) { create(:time_option, event: event2) }
    let(:response_event1) { create(:response, event: event1) }

    it "is valid when the time option belongs to the same event as the response" do
      availability = Availability.new(
        response: response_event1,
        time_option: time_option_event1,
        status: :available
      )

      expect(availability).to be_valid
    end

    it "is invalid when the time option belongs to a different event than the response" do
      availability = Availability.new(
        response: response_event1,
        time_option: time_option_event2,
        status: :available
      )

      expect(availability).not_to be_valid
      expect(availability.errors[:time_option]).to include("must belong to the same event")
    end
  end

  describe "status" do
    it "supports unavailable and available values" do
      expect(Availability.statuses).to eq("unavailable" => 0, "available" => 1)
    end
  end
end
