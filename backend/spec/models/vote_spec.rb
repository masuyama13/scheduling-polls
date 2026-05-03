require "rails_helper"

RSpec.describe Vote, type: :model do
  describe "time option event consistency" do
    let(:event1) { create(:event) }
    let(:event2) { create(:event) }
    let(:time_option_event1) { create(:time_option, event: event1) }
    let(:time_option_event2) { create(:time_option, event: event2) }
    let(:response_event1) { create(:response, event: event1) }

    it "is valid when the time option belongs to the same event as the response" do
      vote = Vote.new(response: response_event1, time_option: time_option_event1, available: true)
      expect(vote).to be_valid
    end

    it "is invalid when the time option belongs to a different event than the response" do
      vote = Vote.new(response: response_event1, time_option: time_option_event2, available: true)
      expect(vote).not_to be_valid
      expect(vote.errors[:time_option]).to include("must belong to the same event")
    end
  end
end
